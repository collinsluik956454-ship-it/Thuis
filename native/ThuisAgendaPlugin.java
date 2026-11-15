package nl.collin.thuis;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.provider.CalendarContract;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * Leest de agenda's op de telefoon (alleen lezen) en zet het bijwerken op de achtergrond aan of uit.
 * Terugkerende afspraken (elke week zwemles) komen ook mee; geannuleerde of afgeslagen afspraken niet.
 */
@CapacitorPlugin(
    name = "ThuisAgenda",
    permissions = { @Permission(alias = "agenda", strings = { Manifest.permission.READ_CALENDAR }) }
)
public class ThuisAgendaPlugin extends Plugin {

    private boolean mag() {
        return getPermissionState("agenda") == PermissionState.GRANTED;
    }

    private void antwoord(PluginCall call, boolean ok) {
        JSObject r = new JSObject();
        r.put("ok", ok);
        r.put("achtergrond", AgendaLezer.aan(getContext()));
        r.put("fout", AgendaLezer.prefs(getContext()).getString("fout", ""));
        call.resolve(r);
    }

    @PluginMethod
    public void status(PluginCall call) {
        antwoord(call, mag());
    }

    @PluginMethod
    public void toegang(PluginCall call) {
        if (mag()) antwoord(call, true);
        else requestPermissionForAlias("agenda", call, "toegangKlaar");
    }

    @PermissionCallback
    private void toegangKlaar(PluginCall call) {
        antwoord(call, mag());
    }

    @PluginMethod
    public void agendas(PluginCall call) {
        if (!mag()) { call.reject("Geen toegang tot de agenda"); return; }
        String[] proj = {
            CalendarContract.Calendars._ID,
            CalendarContract.Calendars.CALENDAR_DISPLAY_NAME,
            CalendarContract.Calendars.ACCOUNT_NAME,
            CalendarContract.Calendars.ACCOUNT_TYPE,
            CalendarContract.Calendars.CALENDAR_COLOR,
            CalendarContract.Calendars.VISIBLE
        };
        JSArray lijst = new JSArray();
        Cursor c = null;
        try {
            c = getContext().getContentResolver().query(CalendarContract.Calendars.CONTENT_URI, proj, null, null, null);
            while (c != null && c.moveToNext()) {
                JSObject o = new JSObject();
                o.put("id", String.valueOf(c.getLong(0)));
                o.put("naam", c.getString(1));
                o.put("account", c.getString(2));
                o.put("type", c.getString(3));
                o.put("kleur", String.format("#%06X", 0xFFFFFF & c.getInt(4)));
                o.put("zichtbaar", c.getInt(5) == 1);
                lijst.put(o);
            }
        } catch (Exception e) {
            call.reject("Agenda's lezen lukte niet: " + e.getMessage());
            return;
        } finally {
            if (c != null) c.close();
        }
        JSObject r = new JSObject();
        r.put("agendas", lijst);
        call.resolve(r);
    }

    private static String[] tekstLijst(JSArray a) {
        if (a == null) return new String[0];
        String[] uit = new String[a.length()];
        for (int i = 0; i < a.length(); i++) uit[i] = a.optString(i, "");
        return uit;
    }

    @PluginMethod
    public void afspraken(PluginCall call) {
        if (!mag()) { call.reject("Geen toegang tot de agenda"); return; }
        long van = call.getData().optLong("van", 0);
        long tot = call.getData().optLong("tot", 0);
        if (van <= 0 || tot <= van) { call.reject("Ongeldige periode"); return; }
        try {
            JSObject r = new JSObject();
            r.put("afspraken", AgendaLezer.afspraken(getContext(), van, tot, tekstLijst(call.getArray("agendas"))));
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Afspraken lezen lukte niet: " + e.getMessage());
        }
    }

    /** Bijwerken op de achtergrond aan (met de gegevens om zelf naar de gezinsdatabase te schrijven) of uit. */
    @PluginMethod
    public void achtergrond(PluginCall call) {
        Context ctx = getContext();
        SharedPreferences p = AgendaLezer.prefs(ctx);
        if (!call.getData().optBoolean("aan", false)) {
            p.edit().clear().apply();
            AgendaLezer.stop(ctx);
            antwoord(call, mag());
            return;
        }
        if (!mag()) { call.reject("Geen toegang tot de agenda"); return; }
        SharedPreferences.Editor e = p.edit();
        for (String veld : new String[] { "db", "key", "uid", "pid", "refresh" }) {
            String w = call.getData().optString(veld, "");
            if (w.isEmpty()) { call.reject("Gegeven ontbreekt: " + veld); return; }
            e.putString(veld, w);
        }
        StringBuilder ids = new StringBuilder();
        for (String id : tekstLijst(call.getArray("ids"))) {
            if (id.isEmpty()) continue;
            if (ids.length() > 0) ids.append(',');
            ids.append(id);
        }
        String oud = p.getString("pid", "") + "|" + p.getString("ids", "");
        if (!oud.equals(call.getData().optString("pid", "") + "|" + ids)) e.remove("hash");
        e.putString("ids", ids.toString()).putBoolean("aan", true).apply();
        AgendaLezer.planIn(ctx);
        antwoord(call, true);
    }
}

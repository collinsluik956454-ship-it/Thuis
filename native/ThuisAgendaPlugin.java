package nl.collin.thuis;

import android.Manifest;
import android.content.ContentUris;
import android.database.Cursor;
import android.net.Uri;
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
 * Leest de agenda's op de telefoon (alleen lezen).
 * Gebruikt CalendarContract.Instances, zodat terugkerende afspraken (elke week zwemles) ook meekomen
 * en geannuleerde of afgeslagen afspraken worden overgeslagen.
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

    @PluginMethod
    public void afspraken(PluginCall call) {
        if (!mag()) { call.reject("Geen toegang tot de agenda"); return; }
        long van = call.getData().optLong("van", 0);
        long tot = call.getData().optLong("tot", 0);
        if (van <= 0 || tot <= van) { call.reject("Ongeldige periode"); return; }

        Uri.Builder b = CalendarContract.Instances.CONTENT_URI.buildUpon();
        ContentUris.appendId(b, van);
        ContentUris.appendId(b, tot);

        String sel = null;
        String[] args = null;
        JSArray ids = call.getArray("agendas");
        if (ids != null && ids.length() > 0) {
            StringBuilder sb = new StringBuilder(CalendarContract.Instances.CALENDAR_ID + " IN (");
            args = new String[ids.length()];
            for (int i = 0; i < ids.length(); i++) {
                sb.append(i == 0 ? "?" : ",?");
                args[i] = ids.optString(i, "");
            }
            sel = sb.append(")").toString();
        }

        String[] proj = {
            CalendarContract.Instances.EVENT_ID,
            CalendarContract.Instances.BEGIN,
            CalendarContract.Instances.END,
            CalendarContract.Instances.TITLE,
            CalendarContract.Instances.EVENT_LOCATION,
            CalendarContract.Instances.ALL_DAY,
            CalendarContract.Instances.CALENDAR_ID,
            CalendarContract.Instances.DISPLAY_COLOR,
            CalendarContract.Instances.STATUS,
            CalendarContract.Instances.SELF_ATTENDEE_STATUS
        };
        JSArray lijst = new JSArray();
        Cursor c = null;
        try {
            c = getContext().getContentResolver().query(b.build(), proj, sel, args, CalendarContract.Instances.BEGIN + " ASC");
            int n = 0;
            while (c != null && c.moveToNext() && n < 600) {
                if (!c.isNull(8) && c.getInt(8) == CalendarContract.Events.STATUS_CANCELED) continue;
                if (!c.isNull(9) && c.getInt(9) == CalendarContract.Attendees.ATTENDEE_STATUS_DECLINED) continue;
                JSObject o = new JSObject();
                o.put("id", c.getLong(0) + "_" + c.getLong(1));
                o.put("van", c.getLong(1));
                o.put("tot", c.getLong(2));
                o.put("titel", c.getString(3));
                o.put("plaats", c.getString(4));
                o.put("heleDag", c.getInt(5) == 1);
                o.put("agenda", String.valueOf(c.getLong(6)));
                o.put("kleur", String.format("#%06X", 0xFFFFFF & c.getInt(7)));
                lijst.put(o);
                n++;
            }
        } catch (Exception e) {
            call.reject("Afspraken lezen lukte niet: " + e.getMessage());
            return;
        } finally {
            if (c != null) c.close();
        }
        JSObject r = new JSObject();
        r.put("afspraken", lijst);
        call.resolve(r);
    }
}

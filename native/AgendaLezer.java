package nl.collin.thuis;

import android.Manifest;
import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.content.ComponentName;
import android.content.ContentUris;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Process;
import android.provider.CalendarContract;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Calendar;

/**
 * Leest afspraken uit de telefoonagenda en zet ze, ook als de app dicht is, in de gezinsdatabase.
 * Alleen lezen: er wordt nooit iets in de agenda veranderd.
 */
final class AgendaLezer {
    static final String PREFS = "thuis_agenda";
    static final int JOB_PERIODIEK = 4201;
    static final int JOB_WIJZIGING = 4202;
    private static final int MAX = 400;

    private AgendaLezer() {}

    static boolean magLezen(Context ctx) {
        return ctx.checkPermission(Manifest.permission.READ_CALENDAR, Process.myPid(), Process.myUid()) == PackageManager.PERMISSION_GRANTED;
    }

    static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static boolean aan(Context ctx) {
        return prefs(ctx).getBoolean("aan", false);
    }

    /** Alle losse afspraken in de periode, ook elke keer van een terugkerende afspraak. */
    static JSONArray afspraken(Context ctx, long van, long tot, String[] ids) throws Exception {
        Uri.Builder b = CalendarContract.Instances.CONTENT_URI.buildUpon();
        ContentUris.appendId(b, van);
        ContentUris.appendId(b, tot);
        String sel = null;
        if (ids != null && ids.length > 0) {
            StringBuilder sb = new StringBuilder(CalendarContract.Instances.CALENDAR_ID + " IN (");
            for (int i = 0; i < ids.length; i++) sb.append(i == 0 ? "?" : ",?");
            sel = sb.append(")").toString();
        } else ids = null;
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
        JSONArray lijst = new JSONArray();
        Cursor c = ctx.getContentResolver().query(b.build(), proj, sel, ids, CalendarContract.Instances.BEGIN + " ASC");
        if (c == null) return lijst;
        try {
            while (c.moveToNext() && lijst.length() < 600) {
                if (!c.isNull(8) && c.getInt(8) == CalendarContract.Events.STATUS_CANCELED) continue;
                if (!c.isNull(9) && c.getInt(9) == CalendarContract.Attendees.ATTENDEE_STATUS_DECLINED) continue;
                JSONObject o = new JSONObject();
                o.put("id", c.getLong(0) + "_" + c.getLong(1));
                o.put("van", c.getLong(1));
                o.put("tot", c.getLong(2));
                o.put("titel", c.isNull(3) ? "" : c.getString(3));
                if (!c.isNull(4)) o.put("plaats", c.getString(4));
                o.put("heleDag", c.getInt(5) == 1);
                o.put("agenda", String.valueOf(c.getLong(6)));
                o.put("kleur", String.format("#%06X", 0xFFFFFF & c.getInt(7)));
                lijst.put(o);
            }
        } finally {
            c.close();
        }
        return lijst;
    }

    /** Zelfde vorm als de app gebruikt: { sleutel: { t, s, e, d, l } }. */
    static JSONObject voorGezin(JSONArray lijst) throws Exception {
        JSONObject ev = new JSONObject();
        for (int i = 0; i < lijst.length() && ev.length() < MAX; i++) {
            JSONObject a = lijst.getJSONObject(i);
            String titel = a.optString("titel", "");
            if (titel.isEmpty()) titel = "(geen titel)";
            JSONObject e = new JSONObject();
            e.put("t", titel.length() > 120 ? titel.substring(0, 120) : titel);
            e.put("s", a.getLong("van"));
            e.put("e", a.optLong("tot", a.getLong("van")));
            if (a.optBoolean("heleDag", false)) e.put("d", 1);
            String plaats = a.optString("plaats", "");
            if (!plaats.isEmpty()) e.put("l", plaats.length() > 80 ? plaats.substring(0, 80) : plaats);
            ev.put(a.getString("id").replaceAll("[.#$\\[\\]/]", "_"), e);
        }
        return ev;
    }

    /** Eén keer bijwerken. Geeft false als het later opnieuw moet (bijv. geen internet). */
    static boolean synchroniseer(Context ctx) {
        SharedPreferences p = prefs(ctx);
        if (!p.getBoolean("aan", false) || !magLezen(ctx)) return true;
        String db = p.getString("db", ""), key = p.getString("key", ""), uid = p.getString("uid", ""), pid = p.getString("pid", ""), refresh = p.getString("refresh", "");
        if (db.isEmpty() || key.isEmpty() || uid.isEmpty() || pid.isEmpty() || refresh.isEmpty()) return true;
        String csv = p.getString("ids", "");
        String[] ids = csv.isEmpty() ? new String[0] : csv.split(",");

        Calendar dag = Calendar.getInstance();
        dag.set(Calendar.HOUR_OF_DAY, 0);
        dag.set(Calendar.MINUTE, 0);
        dag.set(Calendar.SECOND, 0);
        dag.set(Calendar.MILLISECOND, 0);
        dag.add(Calendar.DAY_OF_MONTH, -1);
        long van = dag.getTimeInMillis(), tot = van + 62L * 24 * 3600 * 1000;

        try {
            JSONObject ev = voorGezin(afspraken(ctx, van, tot, ids));
            String inhoud = ev.toString();
            String hash = Integer.toHexString(inhoud.hashCode()) + "-" + inhoud.length();
            long nu = System.currentTimeMillis();
            boolean veranderd = !hash.equals(p.getString("hash", ""));
            if (!veranderd && nu - p.getLong("gezet", 0) < 30L * 60 * 1000) return true;

            String token = vernieuwToken(key, refresh, p);
            String plek = db + "/families/" + uid + "/agenda/" + pid;
            if (veranderd) {
                JSONObject body = new JSONObject();
                body.put("at", nu);
                body.put("n", ev.length());
                body.put("ev", ev);
                http("PUT", plek + ".json?auth=" + enc(token), body.toString(), false);
            } else {
                http("PUT", plek + "/at.json?auth=" + enc(token), String.valueOf(nu), false);
            }
            p.edit().putString("hash", hash).putLong("gezet", nu).remove("fout").apply();
            return true;
        } catch (HttpFout f) {
            p.edit().putString("fout", f.getMessage()).apply();
            return f.code >= 500; // 4xx: inloggen of regels kloppen niet; de app lost dit op bij openen
        } catch (Exception e) {
            return false;
        }
    }

    static void planIn(Context ctx) {
        JobScheduler js = (JobScheduler) ctx.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (js == null) return;
        if (!gepland(js, JOB_PERIODIEK)) {
            js.schedule(new JobInfo.Builder(JOB_PERIODIEK, new ComponentName(ctx, ThuisAgendaJob.class))
                .setPeriodic(15L * 60 * 1000)
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .setPersisted(true)
                .build());
        }
        zorgVoorWijziging(ctx);
    }

    /** Extra taak die start zodra er iets in de agenda verandert (Android 7 en nieuwer). */
    static void zorgVoorWijziging(Context ctx) { zorgVoorWijziging(ctx, false); }

    static void zorgVoorWijziging(Context ctx, boolean opnieuw) {
        if (Build.VERSION.SDK_INT < 24) return;
        JobScheduler js = (JobScheduler) ctx.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (js == null || (!opnieuw && gepland(js, JOB_WIJZIGING))) return;
        js.schedule(new JobInfo.Builder(JOB_WIJZIGING, new ComponentName(ctx, ThuisAgendaJob.class))
            .addTriggerContentUri(new JobInfo.TriggerContentUri(CalendarContract.CONTENT_URI, JobInfo.TriggerContentUri.FLAG_NOTIFY_FOR_DESCENDANTS))
            .setTriggerContentUpdateDelay(30 * 1000)
            .setTriggerContentMaxDelay(10 * 60 * 1000)
            .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
            .build());
    }

    static void stop(Context ctx) {
        JobScheduler js = (JobScheduler) ctx.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (js == null) return;
        js.cancel(JOB_PERIODIEK);
        js.cancel(JOB_WIJZIGING);
    }

    private static boolean gepland(JobScheduler js, int id) {
        for (JobInfo j : js.getAllPendingJobs()) if (j.getId() == id) return true;
        return false;
    }

    private static String vernieuwToken(String key, String refresh, SharedPreferences p) throws Exception {
        String antwoord = http("POST", "https://securetoken.googleapis.com/v1/token?key=" + enc(key),
            "grant_type=refresh_token&refresh_token=" + enc(refresh), true);
        JSONObject j = new JSONObject(antwoord);
        String nieuw = j.optString("refresh_token", "");
        if (!nieuw.isEmpty() && !nieuw.equals(refresh)) p.edit().putString("refresh", nieuw).apply();
        return j.getString("id_token");
    }

    static final class HttpFout extends IOException {
        final int code;
        HttpFout(int code, String tekst) { super("HTTP " + code + ": " + tekst); this.code = code; }
    }

    private static String http(String methode, String adres, String body, boolean formulier) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(adres).openConnection();
        try {
            c.setConnectTimeout(15000);
            c.setReadTimeout(20000);
            c.setRequestMethod(methode);
            if (body != null) {
                c.setDoOutput(true);
                c.setRequestProperty("Content-Type", formulier ? "application/x-www-form-urlencoded" : "application/json; charset=utf-8");
                OutputStream o = c.getOutputStream();
                o.write(body.getBytes("UTF-8"));
                o.close();
            }
            int code = c.getResponseCode();
            String tekst = lees(code >= 400 ? c.getErrorStream() : c.getInputStream());
            if (code >= 400) throw new HttpFout(code, tekst.length() > 200 ? tekst.substring(0, 200) : tekst);
            return tekst;
        } finally {
            c.disconnect();
        }
    }

    private static String lees(InputStream in) throws IOException {
        if (in == null) return "";
        ByteArrayOutputStream uit = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) uit.write(buf, 0, n);
        in.close();
        return uit.toString("UTF-8");
    }

    private static String enc(String s) throws IOException {
        return URLEncoder.encode(s, "UTF-8");
    }
}

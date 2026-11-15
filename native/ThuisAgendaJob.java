package nl.collin.thuis;

import android.app.job.JobParameters;
import android.app.job.JobService;
import android.content.Context;

/** Wordt door Android gestart (ongeveer elk kwartier, en na een wijziging in de agenda), ook als Thuis dicht is. */
public class ThuisAgendaJob extends JobService {

    @Override
    public boolean onStartJob(final JobParameters params) {
        final Context ctx = getApplicationContext();
        new Thread(new Runnable() {
            @Override
            public void run() {
                boolean ok;
                try {
                    ok = AgendaLezer.synchroniseer(ctx);
                } catch (Throwable t) {
                    ok = false;
                }
                boolean wijziging = params.getJobId() == AgendaLezer.JOB_WIJZIGING;
                jobFinished(params, !ok && !wijziging);
                // Een taak die op agendawijzigingen wacht, werkt maar één keer: daarna opnieuw klaarzetten.
                if (AgendaLezer.aan(ctx)) AgendaLezer.zorgVoorWijziging(ctx, wijziging);
            }
        }, "thuis-agenda").start();
        return true;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        return true;
    }
}

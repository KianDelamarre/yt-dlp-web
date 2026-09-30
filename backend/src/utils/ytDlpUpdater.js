import { exec } from 'child_process';
import util from 'util';
import cron from 'node-cron';

const execPromise = util.promisify(exec);

/**
 * Checks for and applies yt-dlp updates.
 */
export async function updateYtDlp() {
    try {
        console.log('[yt-dlp] Running scheduled update check...');
        const { stdout, stderr } = await execPromise('yt-dlp -U');

        if (stderr && !stdout) {
            console.warn('[yt-dlp] Update warning:', stderr.trim());
        } else {
            console.log(`[yt-dlp] ${stdout.trim()}`);
        }
    } catch (error) {
        console.error('[yt-dlp] Scheduled auto-update failed:', error.message);
    }
}

/**
 * Schedules yt-dlp to update every night at a specific time.
 * Standard cron format: "minute hour * * *"
 * Example: "0 3 * * *" runs daily at 3:00 AM container time.
 */
export function scheduleNightlyYtDlpUpdate(cronTime, timezone) {
    cron.schedule(cronTime, async () => {
        await updateYtDlp();
    }, {
        timezone: timezone
    });
    console.log(`[yt-dlp] Scheduled nightly updates configured for cron pattern: "${cronTime}"`);
}
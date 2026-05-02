import { NextRequest, NextResponse } from "next/server";
import { ActivityLogRepo } from "@/modules/system-management/log-activity/services/activity-log.repo";
import { COOKIE_NAME } from "@/lib/auth-utils";

/**
 * GET: Fetch dashboard data + activity list directly via Repository
 */
/**
 * API Route for Activity Logs - Joined with Directus Security Data
 * Version: 2026-04-25-1314
 */
export async function GET(req: NextRequest) {


    try {
        const token = req.cookies.get(COOKIE_NAME)?.value;
        const activities = await ActivityLogRepo.getActivities(token);

        console.info(`[api/activity-logs] Fetched ${activities.length} activities.`);

        // Calculate non-functional dummy stats/charts directly

        const dashboard = {
            stats: ActivityLogRepo.calculateStats(activities),
            timeline: ActivityLogRepo.calculateTimeline(activities),
            distribution: ActivityLogRepo.calculateDistribution(activities),
            trend: ActivityLogRepo.calculateTrend(activities),
            security: ActivityLogRepo.calculateSecurityEvents(activities)
        };

        return NextResponse.json({ ok: true, dashboard, activities });
    } catch (error) {
        console.error("[api/activity-logs] GET error:", error);
        return NextResponse.json(
            { ok: false, message: "Failed to load activity data." },
            { status: 500 }
        );
    }
}

/**
 * POST: Mutations (BLOCK, UNBLOCK, FORCE_RESET, etc.) directly via Repository
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, userId, ...data } = body;

        let success = false;
        let message = "";

        switch (action) {
            case 'BLOCK':
                success = await ActivityLogRepo.blockUser(userId, data.reason);
                message = success ? "User blocked successfully" : "Failed to block user";
                break;

            case 'FORCE_RESET':
                success = await ActivityLogRepo.forcePasswordReset(userId, data.reason);
                message = success ? "Password reset forced successfully" : "Failed to force reset";
                break;

            case 'UNBLOCK':
                success = await ActivityLogRepo.unblockUser(userId);
                message = success ? "User unblocked successfully" : "Failed to unblock user";
                break;

            case 'TIMEOUT':
                success = await ActivityLogRepo.setTimeoutUser(userId, data.duration, data.reason);
                message = success ? "User timeout set successfully" : "Failed to set timeout";
                break;

            case 'SEND_RESET_EMAIL':
                success = await ActivityLogRepo.sendResetEmail(userId);
                message = success ? "Password reset email sent" : "Failed to send email";
                break;

            case 'SEND_NOTIFICATION':
                success = await ActivityLogRepo.sendNotification(userId, data.message);
                message = success ? "Notification sent" : "Failed to send notification";
                break;

            case 'SECURITY_REVIEW':
                success = await ActivityLogRepo.securityReviewUser(userId, data.concerns);
                message = success ? "User flagged for review" : "Failed to flag user";
                break;

            case 'DELETE_LOGS':
                success = await ActivityLogRepo.deleteLogs(userId);
                message = success ? "Logs deleted successfully" : "Failed to delete logs";
                break;

            default:
                return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ success, message });
    } catch (error) {
        console.error("[api/activity-logs] POST error:", error);
        return NextResponse.json({ success: false, message: "An internal error occurred" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { AccountRepo } from "@/modules/system-management/account-management/services/account.repo";

export async function GET() {
    try {
        const users = await AccountRepo.getUsersFromServer();
        return NextResponse.json({ users });
    } catch (error) {
        console.error("[api/account-management] GET error:", error);
        return NextResponse.json({ users: [] }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {


    try {
        const text = await req.text();


        if (!text) {
            console.error("[api/account-management] Empty request body");
            return NextResponse.json({ success: false, message: "Empty request body" }, { status: 400 });
        }

        let body;
        try {
            body = JSON.parse(text);
        } catch (e) {
            console.error("[api/account-management] JSON parse error:", e);
            return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
        }

        const { action, userId, ...data } = body;

        // Extract token from cookies for authorized backend requests
        const token = req.cookies.get('vos_access_token')?.value;

        let success = false;
        let message = "";



        switch (action) {
            case 'BLOCK':
                success = await AccountRepo.blockUser(userId, data.reason, token);
                message = success ? "User blocked successfully" : "Failed to block user. Backend returned an error.";
                break;
            case 'UNBLOCK':
                success = await AccountRepo.unblockUser(userId, token);
                message = success ? "User unblocked successfully" : "Failed to unblock user. Backend returned an error.";
                break;
            case 'FORCE_RESET':
                success = await AccountRepo.forcePasswordReset(userId, data.reason, token);
                message = success ? "Forced reset initiated" : "Failed to force reset";
                break;
            case 'SEND_RESET':
                success = await AccountRepo.sendResetEmail(userId, token);
                message = success ? "Reset email sent" : "Failed to send reset email";
                break;
            case 'DIRECT_CHANGE':
                success = await AccountRepo.changePassword(userId, data.newPassword, data.reason, token);
                message = success ? "Password changed successfully" : "Failed to change password. Backend returned an error.";
                break;
            case 'SET_TIMEOUT':
                success = await AccountRepo.setTimeoutUser(userId, data.duration, data.reason);
                message = success ? "Timeout applied" : "Failed to apply timeout";
                break;
            case 'SEND_NOTIFICATION':
                success = await AccountRepo.sendNotification(userId, data.message);
                message = success ? "Notification sent" : "Failed to send notification";
                break;
            case 'SECURITY_REVIEW':
                success = await AccountRepo.securityReviewUser(userId, data.concerns);
                message = success ? "Flagged for review" : "Failed to flag for review";
                break;
            default:
                console.warn(`[api/account-management] Unknown action: ${action}`);
                return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
        }


        return NextResponse.json({ success, message });
    } catch (error) {
        console.error("[api/account-management] POST error:", error);
        return NextResponse.json({ success: false, message: "Internal server error during action execution" }, { status: 500 });
    }
}

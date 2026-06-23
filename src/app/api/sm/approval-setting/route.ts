import { NextRequest, NextResponse } from "next/server";
import { ApprovalSettingRepo } from "@/modules/system-management/approval-setting/services/approval-setting.repo";
import { ToggleApprovalSchema } from "@/modules/system-management/approval-setting/types/approval-setting.schema";

export async function GET() {
    try {
        const data = await ApprovalSettingRepo.getAllFromServer();
        return NextResponse.json({ data });
    } catch (error) {
        console.error("[api/approval-setting] GET error:", error);
        return NextResponse.json({ data: [] }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const text = await req.text();
        if (!text) {
            return NextResponse.json(
                { success: false, message: "Empty request body" },
                { status: 400 }
            );
        }

        let body: Record<string, unknown>;
        try {
            body = JSON.parse(text);
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid JSON" },
                { status: 400 }
            );
        }

        const { action, ...data } = body;

        switch (action) {
            case "TOGGLE": {
                const parsed = ToggleApprovalSchema.safeParse(data);
                if (!parsed.success) {
                    return NextResponse.json(
                        { success: false, message: parsed.error.message },
                        { status: 400 }
                    );
                }
                const success = await ApprovalSettingRepo.toggleFromServer(parsed.data.id, parsed.data.isApproval);
                return NextResponse.json({
                    success,
                    message: success ? "Approval toggled" : "Failed to toggle",
                });
            }
            default:
                return NextResponse.json(
                    { success: false, message: "Invalid action" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("[api/approval-setting] POST error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

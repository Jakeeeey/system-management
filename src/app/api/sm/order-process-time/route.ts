import { NextRequest, NextResponse } from "next/server";
import { OrderProcessTimeRepo } from "@/modules/system-management/order-process-time/services/order-process-time.repo";
import {
    UpdateProcessTimeSchema,
    QuickAssignUserSchema,
    QuickUpdateMinutesSchema,
} from "@/modules/system-management/order-process-time/types/order-process-time.schema";

export async function GET() {
    try {
        const data = await OrderProcessTimeRepo.getAllFromServer();
        return NextResponse.json({ data });
    } catch (error) {
        console.error("[api/order-process-time] GET error:", error);
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
            case "UPDATE": {
                const parsed = UpdateProcessTimeSchema.safeParse(data);
                if (!parsed.success) {
                    return NextResponse.json(
                        { success: false, message: parsed.error.message },
                        { status: 400 }
                    );
                }
                const success = await OrderProcessTimeRepo.updateFromServer(parsed.data.id, {
                    targetMinutes: parsed.data.targetMinutes,
                    accountableUserId: parsed.data.accountableUserId,
                    description: parsed.data.description,
                    isActive: parsed.data.isActive,
                });
                return NextResponse.json({ success });
            }

            case "ASSIGN_USER": {
                const parsed = QuickAssignUserSchema.safeParse(data);
                if (!parsed.success) {
                    return NextResponse.json(
                        { success: false, message: parsed.error.message },
                        { status: 400 }
                    );
                }
                const success = await OrderProcessTimeRepo.updateFromServer(parsed.data.id, {
                    accountableUserId: parsed.data.accountableUserId,
                });
                return NextResponse.json({ success });
            }

            case "UPDATE_MINUTES": {
                const parsed = QuickUpdateMinutesSchema.safeParse(data);
                if (!parsed.success) {
                    return NextResponse.json(
                        { success: false, message: parsed.error.message },
                        { status: 400 }
                    );
                }
                const success = await OrderProcessTimeRepo.updateFromServer(parsed.data.id, {
                    targetMinutes: parsed.data.targetMinutes,
                });
                return NextResponse.json({ success });
            }

            case "INITIALIZE_DEFAULTS": {
                const result = await OrderProcessTimeRepo.initializeDefaultsFromServer();
                return NextResponse.json({ success: true, data: result });
            }

            default:
                return NextResponse.json(
                    { success: false, message: `Unsupported action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("[api/order-process-time] POST error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

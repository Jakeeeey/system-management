import { NextRequest, NextResponse } from "next/server";
import { GeneralSettingRepo } from "@/modules/system-management/general-setting/services/general-setting.repo";
import {
    UpdateSettingSchema,
    ToggleSettingSchema,
    CreateSettingSchema,
} from "@/modules/system-management/general-setting/types/general-setting.schema";

export async function GET() {
    try {
        const data = await GeneralSettingRepo.getAllFromServer();
        return NextResponse.json({ data });
    } catch (error) {
        console.error("[api/general-setting] GET error:", error);
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
                const parsed = UpdateSettingSchema.safeParse(data);
                if (!parsed.success) {
                    return NextResponse.json(
                        { success: false, message: parsed.error.message },
                        { status: 400 }
                    );
                }
                let success = false;
                if (parsed.data.id) {
                    success = await GeneralSettingRepo.updateValueFromServer(
                        parsed.data.id,
                        parsed.data.settingValue
                    );
                } else if (parsed.data.settingKey) {
                    success = await GeneralSettingRepo.upsertByKeyFromServer(
                        parsed.data.settingKey,
                        parsed.data.settingValue
                    );
                }
                return NextResponse.json({
                    success,
                    message: success ? "Setting updated" : "Failed to update setting",
                });
            }

            case "TOGGLE": {
                const parsed = ToggleSettingSchema.safeParse(data);
                if (!parsed.success) {
                    return NextResponse.json(
                        { success: false, message: parsed.error.message },
                        { status: 400 }
                    );
                }
                const newValue = parsed.data.currentValue ? "0" : "1";
                let success = false;
                if (parsed.data.id) {
                    success = await GeneralSettingRepo.updateValueFromServer(
                        parsed.data.id,
                        newValue
                    );
                } else if (parsed.data.settingKey) {
                    success = await GeneralSettingRepo.upsertByKeyFromServer(
                        parsed.data.settingKey,
                        newValue
                    );
                }
                return NextResponse.json({
                    success,
                    message: success ? "Setting toggled" : "Failed to toggle setting",
                });
            }

            case "INITIALIZE_DEFAULTS": {
                const result = await GeneralSettingRepo.initializeDefaultsFromServer();
                return NextResponse.json({
                    success: true,
                    data: result,
                    message: `Seeded ${result.seeded} missing settings out of ${result.total} defaults.`,
                });
            }

            case "CREATE": {
                const parsed = CreateSettingSchema.safeParse(data);
                if (!parsed.success) {
                    return NextResponse.json(
                        { success: false, message: parsed.error.message },
                        { status: 400 }
                    );
                }
                const success = await GeneralSettingRepo.upsertByKeyFromServer(
                    parsed.data.settingKey,
                    parsed.data.settingValue
                );
                return NextResponse.json({
                    success,
                    message: success ? "Setting created" : "Failed to create setting",
                });
            }

            default:
                return NextResponse.json(
                    { success: false, message: "Invalid action" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("[api/general-setting] POST error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

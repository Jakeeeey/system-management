import {
    GeneralSetting,
    GeneralSettingRaw,
    KNOWN_SETTINGS,
    DEFAULT_KEY_SETTINGS,
    SettingCategory,
    SettingInputType,
} from "../types/general-setting.types";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.DIRECTUS_API_URL || "";
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

export class GeneralSettingRepo {

    static async getAll(): Promise<GeneralSetting[]> {
        if (typeof window !== "undefined") {
            try {
                const res = await fetch("/api/sm/general-setting", { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to fetch through proxy");
                const json = await res.json();
                return json.data || [];
            } catch (err) {
                console.error("[GeneralSettingRepo] Client fetch error:", err);
                return [];
            }
        }
        return this.getAllFromServer();
    }

    static async getAllFromServer(): Promise<GeneralSetting[]> {
        try {
            const res = await fetch(`${DIRECTUS_URL}/items/general_setting?limit=-1&sort=id`, {
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                    ...(STATIC_TOKEN ? { Authorization: `Bearer ${STATIC_TOKEN}` } : {}),
                },
            });

            if (!res.ok) {
                console.error(`[GeneralSettingRepo] Directus error ${res.status}: ${res.statusText}`);
                return [];
            }

            const json = await res.json();
            const rawItems: GeneralSettingRaw[] = json.data || [];
            return rawItems.map(this.mapToSetting);
        } catch (err) {
            console.error("[GeneralSettingRepo] Server fetch error:", err);
            return [];
        }
    }

    static async updateValue(id: number, value: string): Promise<boolean> {
        if (typeof window !== "undefined") {
            return this.proxyAction("UPDATE", { id, settingValue: value });
        }
        return this.updateValueFromServer(id, value);
    }

    static async updateValueFromServer(id: number, value: string): Promise<boolean> {
        try {
            const now = new Date().toISOString();
            const res = await fetch(`${DIRECTUS_URL}/items/general_setting/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(STATIC_TOKEN ? { Authorization: `Bearer ${STATIC_TOKEN}` } : {}),
                },
                body: JSON.stringify({
                    setting_value: value,
                    updated_at: now,
                }),
            });
            return res.ok;
        } catch (err) {
            console.error("[GeneralSettingRepo] Update error:", err);
            return false;
        }
    }

    static async upsertByKey(key: string, value: string): Promise<boolean> {
        if (typeof window !== "undefined") {
            return this.proxyAction("UPDATE", { settingKey: key, settingValue: value });
        }
        return this.upsertByKeyFromServer(key, value);
    }

    static async upsertByKeyFromServer(key: string, value: string): Promise<boolean> {
        try {
            // Check if key exists
            const queryUrl = `${DIRECTUS_URL}/items/general_setting?filter[setting_key][_eq]=${encodeURIComponent(key)}`;
            const res = await fetch(queryUrl, {
                cache: "no-store",
                headers: {
                    ...(STATIC_TOKEN ? { Authorization: `Bearer ${STATIC_TOKEN}` } : {}),
                },
            });

            if (res.ok) {
                const json = await res.json();
                const existing = (json.data || [])[0];
                if (existing?.id) {
                    return this.updateValueFromServer(existing.id, value);
                }
            }

            // Create new
            const now = new Date().toISOString();
            const createRes = await fetch(`${DIRECTUS_URL}/items/general_setting`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(STATIC_TOKEN ? { Authorization: `Bearer ${STATIC_TOKEN}` } : {}),
                },
                body: JSON.stringify({
                    setting_key: key,
                    setting_value: value,
                    created_at: now,
                    updated_at: now,
                }),
            });
            return createRes.ok;
        } catch (err) {
            console.error("[GeneralSettingRepo] Upsert error:", err);
            return false;
        }
    }

    static async toggle(id: number | undefined, key: string | undefined, currentBool: boolean): Promise<boolean> {
        const newValue = currentBool ? "0" : "1";
        if (typeof window !== "undefined") {
            return this.proxyAction("TOGGLE", { id, settingKey: key, currentValue: currentBool });
        }
        if (id) {
            return this.updateValueFromServer(id, newValue);
        }
        if (key) {
            return this.upsertByKeyFromServer(key, newValue);
        }
        return false;
    }

    static async initializeDefaults(): Promise<{ seeded: number; total: number }> {
        if (typeof window !== "undefined") {
            try {
                const res = await fetch("/api/sm/general-setting", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "INITIALIZE_DEFAULTS" }),
                });
                const json = await res.json();
                return json.data || { seeded: 0, total: 0 };
            } catch (err) {
                console.error("[GeneralSettingRepo] Client init defaults error:", err);
                return { seeded: 0, total: 0 };
            }
        }
        return this.initializeDefaultsFromServer();
    }

    static async initializeDefaultsFromServer(): Promise<{ seeded: number; total: number }> {
        try {
            const currentSettings = await this.getAllFromServer();
            const existingKeys = new Set(currentSettings.map((s) => s.settingKey));
            let seeded = 0;

            for (const def of DEFAULT_KEY_SETTINGS) {
                if (!existingKeys.has(def.setting_key)) {
                    const now = new Date().toISOString();
                    const createRes = await fetch(`${DIRECTUS_URL}/items/general_setting`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(STATIC_TOKEN ? { Authorization: `Bearer ${STATIC_TOKEN}` } : {}),
                        },
                        body: JSON.stringify({
                            setting_key: def.setting_key,
                            setting_value: def.setting_value,
                            created_at: now,
                            updated_at: now,
                        }),
                    });
                    if (createRes.ok) {
                        seeded++;
                    }
                }
            }
            return { seeded, total: DEFAULT_KEY_SETTINGS.length };
        } catch (err) {
            console.error("[GeneralSettingRepo] Init defaults error:", err);
            return { seeded: 0, total: DEFAULT_KEY_SETTINGS.length };
        }
    }

    static mapToSetting(raw: GeneralSettingRaw): GeneralSetting {
        const meta = KNOWN_SETTINGS[raw.setting_key];

        const isBoolean = meta ? meta.inputType === "boolean" : (raw.setting_value === "0" || raw.setting_value === "1");
        const booleanValue = isBoolean ? raw.setting_value === "1" : false;

        const title = meta?.title || formatFriendlyKey(raw.setting_key);
        const description = meta?.description || `Configuration setting for ${raw.setting_key}.`;
        const category: SettingCategory = meta?.category || "system";
        const inputType: SettingInputType = meta?.inputType || (isBoolean ? "boolean" : "text");

        return {
            id: raw.id,
            settingKey: raw.setting_key,
            settingValue: raw.setting_value,
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
            title,
            description,
            category,
            inputType,
            isBoolean,
            booleanValue,
        };
    }

    private static async proxyAction(action: string, payload: Record<string, unknown>): Promise<boolean> {
        try {
            const res = await fetch("/api/sm/general-setting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...payload }),
            });
            const json = await res.json();
            return json.success || false;
        } catch (err) {
            console.error(`[GeneralSettingRepo] Proxy error for ${action}:`, err);
            return false;
        }
    }
}

function formatFriendlyKey(key: string): string {
    return key
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

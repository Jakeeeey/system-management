import { ApprovalSetting, ApprovalSettingRaw } from "../types/approval-setting.types";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.DIRECTUS_API_URL || "";
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

export class ApprovalSettingRepo {

    static async getAll(): Promise<ApprovalSetting[]> {
        if (typeof window !== "undefined") {
            try {
                const res = await fetch("/api/sm/approval-setting", { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to fetch through proxy");
                const json = await res.json();
                return json.data || [];
            } catch (err) {
                console.error("[ApprovalSettingRepo] Client fetch error:", err);
                return [];
            }
        }
        return this.getAllFromServer();
    }

    static async getAllFromServer(): Promise<ApprovalSetting[]> {
        try {
            const res = await fetch(`${DIRECTUS_URL}/items/approval_setting?access_token=${STATIC_TOKEN}&limit=-1`, {
                cache: "no-store",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(`Directus error: ${res.status}`);
            const json = await res.json();
            const raw: ApprovalSettingRaw[] = json.data || [];
            return raw.map(this.mapToAppSetting);
        } catch (err) {
            console.error("[ApprovalSettingRepo] Server fetch error:", err);
            return [];
        }
    }

    static async toggle(id: number, isApproval: number): Promise<boolean> {
        if (typeof window !== "undefined") {
            return this.proxyAction("TOGGLE", { id, isApproval });
        }
        return this.toggleFromServer(id, isApproval);
    }

    static async toggleFromServer(id: number, isApproval: number): Promise<boolean> {
        try {
            const res = await fetch(`${DIRECTUS_URL}/items/approval_setting/${id}?access_token=${STATIC_TOKEN}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_approval: isApproval }),
            });
            return res.ok;
        } catch (err) {
            console.error("[ApprovalSettingRepo] Toggle error:", err);
            return false;
        }
    }

    private static mapToAppSetting(raw: ApprovalSettingRaw): ApprovalSetting {
        return {
            id: raw.id,
            moduleName: raw.module_name,
            isApproval: raw.is_approval === 1,
        };
    }

    private static async proxyAction(action: string, payload: Record<string, unknown>): Promise<boolean> {
        try {
            const res = await fetch("/api/sm/approval-setting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...payload }),
            });
            const json = await res.json();
            return json.success || false;
        } catch (err) {
            console.error(`[ApprovalSettingRepo] Proxy error for ${action}:`, err);
            return false;
        }
    }
}

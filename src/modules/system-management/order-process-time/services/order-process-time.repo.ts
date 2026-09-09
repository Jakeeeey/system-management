import {
    OrderProcessTime,
    OrderProcessTimeRaw,
    ORDER_PROCESS_CATEGORIES,
    formatMinutesToHuman,
} from "../types/order-process-time.types";
import { AccountRepo } from "../../account-management/services/account.repo";
import { AccountUser } from "../../account-management/types/account.types";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.DIRECTUS_API_URL || "";
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

export class OrderProcessTimeRepo {
    static async getAll(): Promise<OrderProcessTime[]> {
        if (typeof window !== "undefined") {
            try {
                const res = await fetch("/api/sm/order-process-time", { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to fetch order process times from proxy");
                const json = await res.json();
                return json.data || [];
            } catch (err) {
                console.error("[OrderProcessTimeRepo] Client fetch error:", err);
                return [];
            }
        }
        return this.getAllFromServer();
    }

    static async getAllFromServer(): Promise<OrderProcessTime[]> {
        try {
            const [processRes, users] = await Promise.all([
                fetch(`${DIRECTUS_URL}/items/order_process_time?limit=-1&sort=id`, {
                    cache: "no-store",
                    headers: {
                        "Content-Type": "application/json",
                        ...(STATIC_TOKEN ? { Authorization: `Bearer ${STATIC_TOKEN}` } : {}),
                    },
                }),
                AccountRepo.getUsersFromServer(),
            ]);

            if (!processRes.ok) {
                console.error(`[OrderProcessTimeRepo] Directus error ${processRes.status}: ${processRes.statusText}`);
                return [];
            }

            const json = await processRes.json();
            const rawItems: OrderProcessTimeRaw[] = json.data || [];

            // If table is completely empty, initialize default 8 categories
            if (rawItems.length === 0) {
                await this.initializeDefaultsFromServer();
                return this.getAllFromServer();
            }

            const userMap = new Map<number, AccountUser>();
            users.forEach((u) => {
                if (u.id) userMap.set(u.id, u);
            });

            return rawItems.map((raw, index) => this.mapToProcessTime(raw, userMap, index + 1));
        } catch (err) {
            console.error("[OrderProcessTimeRepo] Server fetch error:", err);
            return [];
        }
    }

    static async update(
        id: number,
        payload: {
            targetMinutes?: number;
            accountableUserId?: number | null;
            description?: string;
            isActive?: boolean;
        }
    ): Promise<boolean> {
        if (typeof window !== "undefined") {
            return this.proxyAction("UPDATE", { id, ...payload });
        }
        return this.updateFromServer(id, payload);
    }

    static async updateFromServer(
        id: number,
        payload: {
            targetMinutes?: number;
            accountableUserId?: number | null;
            description?: string;
            isActive?: boolean;
        }
    ): Promise<boolean> {
        try {
            const directusBody: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (payload.targetMinutes !== undefined) {
                directusBody.target_minutes = payload.targetMinutes;
            }
            if (payload.accountableUserId !== undefined) {
                directusBody.accountable_user_id = payload.accountableUserId;
            }
            if (payload.description !== undefined) {
                directusBody.description = payload.description;
            }
            if (payload.isActive !== undefined) {
                directusBody.is_active = payload.isActive ? 1 : 0;
            }

            const res = await fetch(`${DIRECTUS_URL}/items/order_process_time/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(STATIC_TOKEN ? { Authorization: `Bearer ${STATIC_TOKEN}` } : {}),
                },
                body: JSON.stringify(directusBody),
            });

            return res.ok;
        } catch (err) {
            console.error(`[OrderProcessTimeRepo] Update error for ID ${id}:`, err);
            return false;
        }
    }

    static async initializeDefaultsFromServer(): Promise<{ seeded: number }> {
        try {
            let seeded = 0;
            for (const cat of ORDER_PROCESS_CATEGORIES) {
                const now = new Date().toISOString();
                const createRes = await fetch(`${DIRECTUS_URL}/items/order_process_time`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(STATIC_TOKEN ? { Authorization: `Bearer ${STATIC_TOKEN}` } : {}),
                    },
                    body: JSON.stringify({
                        category_name: cat.name,
                        category_key: cat.key,
                        target_minutes: cat.defaultMinutes,
                        accountable_user_id: null,
                        description: cat.description,
                        is_active: 1,
                        created_at: now,
                        updated_at: now,
                    }),
                });
                if (createRes.ok) seeded++;
            }
            return { seeded };
        } catch (err) {
            console.error("[OrderProcessTimeRepo] Initialize defaults error:", err);
            return { seeded: 0 };
        }
    }

    private static mapToProcessTime(
        raw: OrderProcessTimeRaw,
        userMap: Map<number, AccountUser>,
        stageNumber: number
    ): OrderProcessTime {
        const userId = raw.accountable_user_id ? Number(raw.accountable_user_id) : null;
        const accountableUser = userId ? userMap.get(userId) || null : null;
        const targetMinutes = Number(raw.target_minutes) || 0;

        return {
            id: raw.id,
            categoryName: raw.category_name,
            categoryKey: raw.category_key,
            targetMinutes,
            accountableUserId: userId,
            accountableUser,
            description: raw.description,
            isActive: raw.is_active === 1 || raw.is_active === true,
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
            formattedTime: formatMinutesToHuman(targetMinutes),
            stageNumber,
        };
    }

    private static async proxyAction(action: string, payload: Record<string, unknown>): Promise<boolean> {
        try {
            const res = await fetch("/api/sm/order-process-time", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...payload }),
            });
            const json = await res.json();
            return json.success || false;
        } catch (err) {
            console.error(`[OrderProcessTimeRepo] Proxy error for ${action}:`, err);
            return false;
        }
    }
}

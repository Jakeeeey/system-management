import { AccountUser, DirectusUser } from "../types/account.types";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.DIRECTUS_API_URL || "";
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";
const SPRING_API_URL = process.env.SPRING_API_BASE_URL || "";

export class AccountRepo {
    /**
     * Entry point for fetching users.
     * Automatically handles client-side proxying to bypass CORS.
     */
    static async getUsers(): Promise<AccountUser[]> {
        if (typeof window !== 'undefined') {
            try {
                const response = await fetch('/api/account-management', {
                    cache: 'no-store'
                });
                if (!response.ok) throw new Error("Failed to fetch through proxy");
                const result = await response.json();
                return result.users || [];
            } catch (error) {
                console.error("[AccountRepo] Client-side fetch error:", error);
                return [];
            }
        }
        return this.getUsersFromServer();
    }

    /**
     * Server-only method to fetch directly from Directus.
     */
    static async getUsersFromServer(): Promise<AccountUser[]> {
        try {
            const response = await fetch(`${DIRECTUS_URL}/items/user?access_token=${STATIC_TOKEN}&limit=-1`, {
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch users from Directus: ${response.statusText}`);
            }

            const result = await response.json();
            const data: DirectusUser[] = result.data || [];

            return data.map(user => this.mapToAccountUser(user));
        } catch (error) {
            console.error("[AccountRepo] Server-side fetch error:", error);
            return [];
        }
    }

    /**
     * Server-only method to fetch a single user by email.
     */
    static async getUserByEmail(email: string): Promise<AccountUser | null> {
        try {
            const filter = encodeURIComponent(JSON.stringify({ user_email: { _eq: email } }));
            const url = `${DIRECTUS_URL}/items/user?access_token=${STATIC_TOKEN}&filter=${filter}&limit=1`;

            const response = await fetch(url, {
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) return null;

            const result = await response.json();
            const data = result.data?.[0];
            return data ? this.mapToAccountUser(data) : null;
        } catch (error) {
            console.error("[AccountRepo] getUserByEmail error:", error);
            return null;
        }
    }

    private static mapToAccountUser(user: DirectusUser): AccountUser {
        const fullName = [user.user_fname, user.user_mname, user.user_lname]
            .filter(Boolean)
            .join(" ");

        // Handle Directus/DB variations where boolean might be a Buffer [0] or [1]
        const isBlockedRaw = user.is_blocked;
        const isBlocked = typeof isBlockedRaw === 'boolean'
            ? isBlockedRaw
            : !!(isBlockedRaw as Buffer | null);

        let status: 'ACTIVE' | 'BLOCKED' | 'LOCKED' = 'ACTIVE';
        if (isBlocked) {
            status = 'BLOCKED';
        } else if (user.lock_until) {
            const safeDateString = user.lock_until.replace(' ', 'T') + (user.lock_until.endsWith('Z') ? '' : 'Z');
            if (new Date(safeDateString) > new Date()) {
                status = 'LOCKED';
            }
        }

        // Fix image URL mapping - handle absolute paths vs Directus asset IDs
        let imageUrl = null;
        if (user.user_image) {
            if (user.user_image.startsWith('http') || user.user_image.startsWith('/')) {
                imageUrl = `${DIRECTUS_URL}${user.user_image.startsWith('/') ? '' : '/'}${user.user_image}`;
            } else {
                imageUrl = `${DIRECTUS_URL}/assets/${user.user_image}`;
            }
        }

        return {
            id: user.user_id,
            email: user.user_email,
            firstName: user.user_fname,
            lastName: user.user_lname,
            fullName,
            position: user.user_position || "N/A",
            role: user.role || "USER",
            image: imageUrl,
            isBlocked: isBlocked,
            lockUntil: user.lock_until,
            failedAttempts: user.failed_attempts || 0,
            status,
            dateOfHire: user.user_dateOfHire || null
        };
    }

    /**
     * Generic action executor that proxies from client to server.
     */
    private static async proxyAction(action: string, payload: Record<string, unknown>): Promise<boolean> {
        if (typeof window !== 'undefined') {

            try {
                const response = await fetch('/api/account-management', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, ...payload })
                });



                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const result = await response.json();

                    return result.success || false;
                } else {
                    const text = await response.text();
                    console.error(`[AccountRepo] Expected JSON but got:`, text);
                    return false;
                }
            } catch (error) {
                console.error(`[AccountRepo] Client proxy error for ${action}:`, error);
                return false;
            }
        }
        return false;
    }

    // Actions - Using proxy pattern
    static async blockUser(userId: number, reason: string, token?: string): Promise<boolean> {
        if (typeof window !== 'undefined') return this.proxyAction('BLOCK', { userId, reason });

        try {
            const response = await fetch(`${SPRING_API_URL}/api/users/${userId}/block`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ reason })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[AccountRepo] Server block error for ${userId}. Status: ${response.status}, Body: ${errorText}`);
            }
            return response.ok;
        } catch (error) {
            console.error(`[AccountRepo] Server block error for ${userId}:`, error);
            return false;
        }
    }

    static async unblockUser(userId: number, token?: string): Promise<boolean> {
        if (typeof window !== 'undefined') return this.proxyAction('UNBLOCK', { userId });

        try {
            const response = await fetch(`${SPRING_API_URL}/api/users/${userId}/unblock`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[AccountRepo] Server unblock error for ${userId}. Status: ${response.status}, Body: ${errorText}`);
            }
            return response.ok;
        } catch (error) {
            console.error(`[AccountRepo] Server unblock error for ${userId}:`, error);
            return false;
        }
    }

    static async forcePasswordReset(userId: number, reason: string, token?: string): Promise<boolean> {
        if (typeof window !== 'undefined') return this.proxyAction('FORCE_RESET', { userId, reason });

        try {
            const url = `${SPRING_API_URL}/api/users/${userId}/force-reset`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    reason: reason || "Security compliance",
                    forceReset: true
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error(`[AccountRepo] Server force reset error for ${userId}. Status: ${response.status}, Body: ${errorData}`);
            }
            return response.ok;
        } catch (error) {
            console.error(`[AccountRepo] Server force reset error for ${userId}:`, error);
            return false;
        }
    }

    static async sendResetEmail(userId: number, token?: string): Promise<boolean> {
        if (typeof window !== 'undefined') return this.proxyAction('SEND_RESET', { userId });

        try {
            const url = `${SPRING_API_URL}/api/users/${userId}/send-reset-email`;


            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    reason: "User requested reset",
                    forceReset: false
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[AccountRepo] Server send reset email error for ${userId}. Status: ${response.status}, Body: ${errorText}`);
            }
            return response.ok;
        } catch (error) {
            console.error(`[AccountRepo] Server send reset email error for ${userId}:`, error);
            return false;
        }
    }

    static async changePassword(userId: number, newPassword: string, reason: string, token?: string): Promise<boolean> {
        if (typeof window !== 'undefined') return this.proxyAction('DIRECT_CHANGE', { userId, newPassword, reason });

        try {
            const url = `${SPRING_API_URL}/users/${userId}/change-password`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    newPassword,
                    reason
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error(`[AccountRepo] Server change password error for ${userId}. Status: ${response.status}, Body: ${errorData}`);
            }
            return response.ok;
        } catch (error) {
            console.error(`[AccountRepo] Server change password error for ${userId}:`, error);
            return false;
        }
    }

    static async setTimeoutUser(userId: number, duration: string, reason: string): Promise<boolean> {
        if (typeof window !== 'undefined') return this.proxyAction('SET_TIMEOUT', { userId, duration, reason });

        return true;
    }

    static async sendNotification(userId: number, message: string): Promise<boolean> {
        if (typeof window !== 'undefined') return this.proxyAction('SEND_NOTIFICATION', { userId, message });

        return true;
    }

    static async securityReviewUser(userId: number, concerns: string): Promise<boolean> {
        if (typeof window !== 'undefined') return this.proxyAction('SECURITY_REVIEW', { userId, concerns });

        return true;
    }
}

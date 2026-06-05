"use client"

import * as React from "react"
import { AccountUser } from "../types/account.types"
import { AccountRepo } from "../services/account.repo"
import { toast } from "sonner"

interface AccountActionPayload {
    userId: number;
    reason?: string;
    duration?: string;
    message?: string;
    concerns?: string;
    newPassword?: string;
}

export function useAccounts() {
    const [users, setUsers] = React.useState<AccountUser[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchUsers = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await AccountRepo.getUsers();
            setUsers(data);
        } catch (_err) {
            setError("Failed to load users");
            toast.error("Failed to load users from Directus");
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const executeAction = async (action: string, data: AccountActionPayload): Promise<boolean> => {
        let success = false;
        try {
            switch (action) {
                case 'BLOCK':
                    success = await AccountRepo.blockUser(data.userId, data.reason ?? "");
                    if (success) toast.success("User blocked successfully");
                    break;
                case 'UNBLOCK':
                    success = await AccountRepo.unblockUser(data.userId);
                    if (success) toast.success("User unblocked successfully");
                    break;
                case 'FORCE_RESET':
                    success = await AccountRepo.forcePasswordReset(data.userId, data.reason ?? "");
                    if (success) toast.success("Password reset forced");
                    break;
                case 'SEND_RESET':
                    success = await AccountRepo.sendResetEmail(data.userId);
                    if (success) toast.success("Reset email sent");
                    break;
                case 'DIRECT_CHANGE':
                    success = await AccountRepo.changePassword(data.userId, data.newPassword ?? "", data.reason ?? "");
                    if (success) toast.success("Password changed successfully");
                    break;
                case 'SET_TIMEOUT':
                    success = await AccountRepo.setTimeoutUser(data.userId, data.duration ?? "", data.reason ?? "");
                    if (success) toast.success(`Timeout set for ${data.duration}`);
                    break;
                case 'SEND_NOTIFICATION':
                    success = await AccountRepo.sendNotification(data.userId, data.message ?? "");
                    if (success) toast.success("Notification sent");
                    break;
                case 'SECURITY_REVIEW':
                    success = await AccountRepo.securityReviewUser(data.userId, data.concerns ?? "");
                    if (success) toast.success("User flagged for security review");
                    break;
                default:
                    console.warn("Unknown action:", action);
            }

            if (success) {
                // Refresh list or update local state
                fetchUsers();
            } else {
                toast.error(`Action ${action} failed. Please check the logs.`);
            }
            return success;
        } catch (err) {
            console.error("[useAccounts] executeAction error:", err);
            toast.error("An unexpected error occurred.");
            return false;
        }
    };

    return {
        users,
        isLoading,
        error,
        refresh: fetchUsers,
        executeAction
    };
}

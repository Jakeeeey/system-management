"use client";

import * as React from "react";
import { OrderProcessTime } from "../types/order-process-time.types";
import { OrderProcessTimeRepo } from "../services/order-process-time.repo";
import { AccountRepo } from "../../account-management/services/account.repo";
import { AccountUser } from "../../account-management/types/account.types";
import { toast } from "sonner";

export function useOrderProcessTime() {
    const [processTimes, setProcessTimes] = React.useState<OrderProcessTime[]>([]);
    const [users, setUsers] = React.useState<AccountUser[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isUsersLoading, setIsUsersLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    const loadData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await OrderProcessTimeRepo.getAll();
            setProcessTimes(data);
        } catch (error) {
            console.error("[useOrderProcessTime] Fetch error:", error);
            toast.error("Failed to load order process times");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadUsers = React.useCallback(async () => {
        setIsUsersLoading(true);
        try {
            const userList = await AccountRepo.getUsers();
            setUsers(userList);
        } catch (error) {
            console.error("[useOrderProcessTime] Users fetch error:", error);
        } finally {
            setIsUsersLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadData();
        loadUsers();
    }, [loadData, loadUsers]);

    const updateMinutes = async (id: number, minutes: number): Promise<boolean> => {
        if (minutes < 1) {
            toast.error("Target time must be at least 1 minute");
            return false;
        }

        setIsSaving(true);
        // Optimistic update
        setProcessTimes((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          targetMinutes: minutes,
                          formattedTime: `${minutes}m`,
                      }
                    : item
            )
        );

        try {
            const success = await OrderProcessTimeRepo.update(id, { targetMinutes: minutes });
            if (success) {
                toast.success("Target processing time updated");
                await loadData();
                return true;
            } else {
                toast.error("Failed to update target time");
                await loadData();
                return false;
            }
        } catch (error) {
            console.error("[useOrderProcessTime] Update minutes error:", error);
            toast.error("An error occurred while updating target time");
            await loadData();
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const assignUser = async (id: number, userId: number | null): Promise<boolean> => {
        setIsSaving(true);
        const selectedUser = userId ? users.find((u) => u.id === userId) || null : null;

        // Optimistic update
        setProcessTimes((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          accountableUserId: userId,
                          accountableUser: selectedUser,
                      }
                    : item
            )
        );

        try {
            const success = await OrderProcessTimeRepo.update(id, { accountableUserId: userId });
            if (success) {
                toast.success(
                    userId
                        ? `Assigned ${selectedUser?.fullName || "person"} as accountable`
                        : "Accountable person unassigned"
                );
                await loadData();
                return true;
            } else {
                toast.error("Failed to update accountable personnel");
                await loadData();
                return false;
            }
        } catch (error) {
            console.error("[useOrderProcessTime] Assign user error:", error);
            toast.error("An error occurred while assigning personnel");
            await loadData();
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const updateProcessTime = async (
        id: number,
        payload: {
            targetMinutes?: number;
            accountableUserId?: number | null;
            description?: string;
            isActive?: boolean;
        }
    ): Promise<boolean> => {
        setIsSaving(true);
        try {
            const success = await OrderProcessTimeRepo.update(id, payload);
            if (success) {
                toast.success("Order process stage updated successfully");
                await loadData();
                return true;
            } else {
                toast.error("Failed to save changes");
                return false;
            }
        } catch (error) {
            console.error("[useOrderProcessTime] Full update error:", error);
            toast.error("Failed to save stage configurations");
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        processTimes,
        users,
        isLoading,
        isUsersLoading,
        isSaving,
        updateMinutes,
        assignUser,
        updateProcessTime,
        refresh: loadData,
    };
}

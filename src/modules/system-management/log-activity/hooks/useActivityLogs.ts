"use client"

import { useState, useCallback, useEffect } from "react";
import { 
    ActivityLogEntry, 
    ActivityDashboardStats, 
    TimelineData, 
    DistributionData, 
    TrendData, 
    SecurityEventData
} from "../types/activity-log.types";
import { toast } from "sonner";

/**
 * Hook to manage User Activity Logs dashboard state
 */
export const useActivityLogs = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<ActivityDashboardStats | null>(null);
    const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<ActivityLogEntry[]>([]);
    const [charts, setCharts] = useState<{
        timeline: TimelineData[];
        distribution: DistributionData[];
        trend: TrendData[];
        security: SecurityEventData[];
    } | null>(null);

    const [activeTab, setActiveTab] = useState<string>("All Activities");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined
    });

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/activity-logs");
            const data = await res.json();

            if (!res.ok || !data?.ok) {
                throw new Error(data?.message ?? "Failed to load data.");
            }

            const { dashboard, activities: allActivities } = data;

            setStats(dashboard.stats);
            setCharts({
                timeline: dashboard.timeline,
                distribution: dashboard.distribution,
                trend: dashboard.trend,
                security: dashboard.security
            });
            setActivities(allActivities);
            setFilteredActivities(allActivities);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast.error("Error", {
                description: "Failed to load activity logs data."
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);


    // Filtering logic
    useEffect(() => {
        let result = activities;

        // Filter by tab
        if (activeTab !== "All Activities") {
            result = result.filter(a => a.type === activeTab);
        }

        // Filter by search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a => 
                a.userName.toLowerCase().includes(q) || 
                a.userEmail.toLowerCase().includes(q) ||
                (a.location?.toLowerCase().includes(q) ?? false) ||
                a.ipAddress.includes(q) ||
                a.type.toLowerCase().includes(q)
            );
        }

        // Filter by date range
        if (dateRange.from || dateRange.to) {
            result = result.filter(a => {
                if (!a.timestamp) return false;
                try {
                    const logDate = new Date(a.timestamp);
                    const checkDate = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());

                    if (dateRange.from) {
                        const fromDate = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
                        if (checkDate < fromDate) return false;
                    }
                    if (dateRange.to) {
                        const toDate = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate());
                        if (checkDate > toDate) return false;
                    }
                    return true;
                } catch {
                    return false;
                }
            });
        }

        setFilteredActivities(result);
    }, [activeTab, searchQuery, activities, dateRange]);

    const counts: Record<string, number> = {
        "All Activities": activities.length,
        "LOGIN": activities.filter(a => a.type === "LOGIN").length,
        "LOGOUT": activities.filter(a => a.type === "LOGOUT").length,
        "BLOCK": activities.filter(a => a.type === "BLOCK").length,
        "UNBLOCK": activities.filter(a => a.type === "UNBLOCK").length,
        "FORCE_RESET": activities.filter(a => a.type === "FORCE_RESET").length,
        "RESET_EMAIL": activities.filter(a => a.type === "RESET_EMAIL").length,
        "FORGOT_PASSWORD": activities.filter(a => a.type === "FORGOT_PASSWORD").length,
        "VERIFY_OTP": activities.filter(a => a.type === "VERIFY_OTP").length,
        "CHANGE_PASSWORD": activities.filter(a => a.type === "CHANGE_PASSWORD").length,
        "CREATE_USER": activities.filter(a => a.type === "CREATE_USER").length,
        "UPDATE_USER": activities.filter(a => a.type === "UPDATE_USER").length,
        "DELETE_USER": activities.filter(a => a.type === "DELETE_USER").length,
    };

    return {
        isLoading,
        stats,
        activities: filteredActivities,
        charts,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        counts,
        actions: {
            refresh: fetchDashboardData
        }
    };
};

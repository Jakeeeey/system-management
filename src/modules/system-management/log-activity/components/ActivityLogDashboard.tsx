"use client"

import * as React from "react"
import { useActivityLogs } from "../hooks/useActivityLogs"
import { StatCards } from "./StatCards"
import { ActivityLogTable } from "./ActivityLogTable"
import { Button } from "@/components/ui/button"
import { 
    RefreshCcw, 
    Download, 
    Bell
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function ActivityLogDashboard() {
    const { 
        isLoading, 
        stats, 
        activities, 
        charts, 
        activeTab, 
        setActiveTab, 
        searchQuery, 
        setSearchQuery,
        counts,
        actions 
    } = useActivityLogs();

    if (isLoading || !stats || !charts) {
        return <ActivityLogSkeleton />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header section with Stats */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">User Activity Logs</h1>
                        <p className="text-sm text-slate-500 dark:text-white/40 font-medium">Monitor all user activities in real-time</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={actions.refresh} className="bg-slate-900/5 dark:bg-white/5 border-slate-200 dark:border-white/10 h-9 text-xs font-bold uppercase tracking-wider">
                            <RefreshCcw className="w-4 h-4 mr-2 text-emerald-500" /> Refresh
                        </Button>
                        <Button variant="outline" size="sm" className="bg-slate-900/5 dark:bg-white/5 border-slate-200 dark:border-white/10 h-9 text-xs font-bold uppercase tracking-wider">
                            <Download className="w-4 h-4 mr-2 text-orange-500" /> Export
                        </Button>
                        <Button variant="outline" size="icon" className="bg-slate-900/5 dark:bg-white/5 border-slate-200 dark:border-white/10 h-9 w-9">
                            <Bell className="w-4 h-4 text-cyan-500" />
                        </Button>
                    </div>
                </div>

                <StatCards stats={stats} />
            </div>

            <div className="space-y-4">
                <ActivityLogTable 
                    data={activities}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    counts={counts}
                />
            </div>
        </div>
    );
}

function ActivityLogSkeleton() {
    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 bg-slate-200 dark:bg-white/5" />
                    <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-white/5" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-white/5" />
                    <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-white/5" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 bg-slate-200 dark:bg-white/5 rounded-2xl" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 bg-slate-200 dark:bg-white/5 rounded-2xl" />)}
            </div>
            <Skeleton className="h-96 bg-slate-200 dark:bg-white/5 rounded-2xl" />
        </div>
    );
}

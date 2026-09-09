"use client";

import * as React from "react";
import { useOrderProcessTime } from "./hooks/useOrderProcessTime";
import { OrderProcessCards } from "./components/OrderProcessCards";
import { OrderProcessTable } from "./components/OrderProcessTable";
import { EditProcessTimeDialog } from "./components/EditProcessTimeDialog";
import { GlassCard } from "@/components/command-center/GlassCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderProcessTime, formatMinutesToHuman } from "./types/order-process-time.types";
import {
    Clock,
    Timer,
    Layers,
    UserCheck,
    AlertCircle,
    RefreshCcw,
    LayoutGrid,
    List,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrderProcessTimePage() {
    const {
        processTimes,
        users,
        isLoading,
        updateMinutes,
        assignUser,
        updateProcessTime,
        refresh,
    } = useOrderProcessTime();

    const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
    const [editingStage, setEditingStage] = React.useState<OrderProcessTime | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    // Compute KPIs
    const totalMinutes = React.useMemo(() => {
        return processTimes.reduce((acc, curr) => acc + (curr.targetMinutes || 0), 0);
    }, [processTimes]);

    const assignedCount = React.useMemo(() => {
        return processTimes.filter((s) => Boolean(s.accountableUserId)).length;
    }, [processTimes]);

    const unassignedCount = React.useMemo(() => {
        return processTimes.length - assignedCount;
    }, [processTimes, assignedCount]);

    const handleOpenEdit = (stage: OrderProcessTime) => {
        setEditingStage(stage);
        setIsEditModalOpen(true);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
                            <Timer className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                                    Order Process Time
                                </h2>
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <Sparkles className="w-3 h-3" /> SLA Engine
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Configure target execution times and assign personnel accountability across all 8 order stages.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Switcher */}
                    <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-white/5">
                        <Button
                            size="sm"
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            onClick={() => setViewMode("grid")}
                            className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            Cards
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === "table" ? "default" : "ghost"}
                            onClick={() => setViewMode("table")}
                            className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5"
                        >
                            <List className="w-3.5 h-3.5" />
                            Table
                        </Button>
                    </div>

                    <Button
                        onClick={() => refresh()}
                        variant="outline"
                        className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-wider"
                    >
                        <RefreshCcw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Total Pipeline Time */}
                <GlassCard accent="indigo" className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shadow-inner">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Target Cycle SLA
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {formatMinutesToHuman(totalMinutes)}
                            </p>
                            <span className="text-[10px] text-blue-500 font-mono font-bold">
                                {totalMinutes} cumulative mins
                            </span>
                        </div>
                    </div>
                </GlassCard>

                {/* KPI 2: Total Stages */}
                <GlassCard accent="cyan" className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500 shadow-inner">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Pipeline Stages
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {processTimes.length}
                            </p>
                            <span className="text-[10px] text-cyan-500 font-bold">
                                Active Order Workflow
                            </span>
                        </div>
                    </div>
                </GlassCard>

                {/* KPI 3: Assigned Stages */}
                <GlassCard accent="emerald" className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Personnel Assigned
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {assignedCount}
                            </p>
                            <span className="text-[10px] text-emerald-500 font-bold">
                                Accountable Staff Designated
                            </span>
                        </div>
                    </div>
                </GlassCard>

                {/* KPI 4: Unassigned Stages */}
                <GlassCard accent="amber" className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Unassigned Stages
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {unassignedCount}
                            </p>
                            <span className="text-[10px] text-amber-500 font-bold">
                                {unassignedCount === 0 ? "All stages assigned" : "Awaiting assignment"}
                            </span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Main Content Area */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="p-5 rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-10 w-10 rounded-2xl" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-12 w-full rounded-2xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : viewMode === "grid" ? (
                <OrderProcessCards
                    data={processTimes}
                    users={users}
                    onUpdateMinutes={updateMinutes}
                    onAssignUser={assignUser}
                    onOpenEditModal={handleOpenEdit}
                />
            ) : (
                <OrderProcessTable
                    data={processTimes}
                    users={users}
                    onUpdateMinutes={updateMinutes}
                    onAssignUser={assignUser}
                    onOpenEditModal={handleOpenEdit}
                />
            )}

            {/* Edit Modal Dialog */}
            <EditProcessTimeDialog
                stage={editingStage}
                users={users}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onSave={updateProcessTime}
            />
        </div>
    );
}

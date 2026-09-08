"use client";

import * as React from "react";
import { useGeneralSettings } from "./hooks/useGeneralSettings";
import { GeneralSettingCards } from "./components/GeneralSettingCards";
import { GeneralSettingTable } from "./components/GeneralSettingTable";
import { EditSettingDialog } from "./components/EditSettingDialog";
import { GlassCard } from "@/components/command-center/GlassCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GeneralSetting } from "./types/general-setting.types";
import { cn } from "@/lib/utils";
import {
    Sliders,
    RefreshCcw,
    Sparkles,
    Radio,
    ShieldCheck,
    Clock,
    LayoutGrid,
    TableProperties,
    Layers,
    RotateCcw,
} from "lucide-react";

export default function GeneralSettingPage() {
    const {
        settings,
        isLoading,
        isInitializing,
        refresh,
        toggleSetting,
        updateSetting,
        initializeDefaults,
        getSettingByKey,
    } = useGeneralSettings();

    const [selectedSetting, setSelectedSetting] = React.useState<GeneralSetting | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const handleOpenEditModal = (setting: GeneralSetting) => {
        setSelectedSetting(setting);
        setIsEditModalOpen(true);
    };

    // Calculate Summary Stats
    const totalCount = settings.length;

    const attendanceHardwareActiveCount = React.useMemo(() => {
        const keys = ["rfid_attendance", "face_attendance", "rfid_asset_tagging"];
        return settings.filter(
            (s) => keys.includes(s.settingKey) && s.booleanValue
        ).length;
    }, [settings]);

    const payrollReadOnlyCount = React.useMemo(() => {
        const keys = [
            "payroll_employee_management_read_only",
            "payroll_department_management_read_only",
        ];
        return settings.filter(
            (s) => keys.includes(s.settingKey) && s.booleanValue
        ).length;
    }, [settings]);

    const timezoneSetting = getSettingByKey("time_zone");
    const activeTimezone = timezoneSetting?.settingValue || "Asia/Manila";

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
                        <Sliders className="w-8 h-8 text-primary" />
                        General Settings
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Configure global system parameters, attendance modes, module permissions, and terminology standards.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => initializeDefaults()}
                        disabled={isInitializing || isLoading}
                        variant="outline"
                        className="h-11 px-4 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300"
                        title="Ensure all standard system settings exist in the database"
                    >
                        <RotateCcw className={cn("w-4 h-4 mr-2", isInitializing && "animate-spin")} />
                        Sync Defaults
                    </Button>
                    <Button
                        onClick={() => refresh()}
                        disabled={isLoading}
                        variant="outline"
                        className="h-11 px-5 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-widest"
                    >
                        <RefreshCcw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Settings */}
                <GlassCard accent="cyan" className="p-5 border-cyan-500/10 shadow-cyan-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500 shadow-inner">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Total Settings
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {totalCount}
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* Attendance Active */}
                <GlassCard accent="emerald" className="p-5 border-emerald-500/10 shadow-emerald-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                            <Radio className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Attendance Modules Active
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {attendanceHardwareActiveCount} / 3
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* Payroll Protection */}
                <GlassCard accent="rose" className="p-5 border-rose-500/10 shadow-rose-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 shadow-inner">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Payroll Locks Active
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {payrollReadOnlyCount} / 2
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* System Timezone */}
                <GlassCard accent="indigo" className="p-5 border-indigo-500/10 shadow-indigo-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                System Timezone
                            </p>
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate" title={activeTimezone}>
                                {activeTimezone}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Navigation Tabs (Categorized Cards vs Table Registry) */}
            <Tabs defaultValue="categorized" className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200/60 dark:border-white/5 pb-4">
                    <TabsList className="bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/60 dark:border-white/5">
                        <TabsTrigger
                            value="categorized"
                            className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
                        >
                            <LayoutGrid className="w-3.5 h-3.5 mr-2" />
                            Categorized Controls
                        </TabsTrigger>
                        <TabsTrigger
                            value="registry"
                            className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
                        >
                            <TableProperties className="w-3.5 h-3.5 mr-2" />
                            Configuration Registry
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>Changes apply globally in real-time</span>
                    </div>
                </div>

                <TabsContent value="categorized" className="space-y-6 m-0 focus-visible:outline-none">
                    <GeneralSettingCards
                        settings={settings}
                        onToggle={toggleSetting}
                        onUpdate={updateSetting}
                        onOpenEditModal={handleOpenEditModal}
                    />
                </TabsContent>

                <TabsContent value="registry" className="space-y-6 m-0 focus-visible:outline-none">
                    <GeneralSettingTable
                        data={settings}
                        isLoading={isLoading}
                        onToggle={toggleSetting}
                        onOpenEditModal={handleOpenEditModal}
                    />
                </TabsContent>
            </Tabs>

            {/* Edit Setting Dialog (shadcn modal) */}
            <EditSettingDialog
                setting={selectedSetting}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onSave={updateSetting}
            />
        </div>
    );
}

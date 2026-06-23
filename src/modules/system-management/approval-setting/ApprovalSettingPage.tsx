"use client"

import * as React from "react"
import { useApprovalSettings } from "./hooks/useApprovalSettings"
import { ApprovalSettingTable } from "./components/ApprovalSettingTable"
import { GlassCard } from "@/components/command-center/GlassCard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    ShieldCheck,
    ShieldOff,
    Layers,
    RefreshCcw,
} from "lucide-react"

export default function ApprovalSettingPage() {
    const { settings, isLoading, refresh, toggleApproval } = useApprovalSettings()

    const enabledCount = React.useMemo(
        () => settings.filter((s) => s.isApproval).length,
        [settings]
    )
    const disabledCount = React.useMemo(
        () => settings.filter((s) => !s.isApproval).length,
        [settings]
    )

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        Approval Settings
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Configure which modules require approval workflows.
                    </p>
                </div>
                <Button
                    onClick={() => refresh()}
                    variant="outline"
                    className="h-11 px-5 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-widest"
                >
                    <RefreshCcw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassCard className="p-5 border-blue-500/10 shadow-blue-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shadow-inner">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Modules</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{settings.length}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-5 border-emerald-500/10 shadow-emerald-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Approval Enabled</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{enabledCount}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-5 border-slate-500/10 shadow-slate-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-slate-500/10 text-slate-500 shadow-inner">
                            <ShieldOff className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Approval Disabled</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{disabledCount}</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <ApprovalSettingTable
                data={settings}
                isLoading={isLoading}
                onToggle={toggleApproval}
            />
        </div>
    )
}

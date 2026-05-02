"use client"

import * as React from "react"
import { GlassCard } from "@/components/command-center/GlassCard"
import { Sparkline } from "@/components/command-center/Sparkline"
import { ActivityDashboardStats } from "../types/activity-log.types"
import { Activity, Users, ShieldAlert, UserX } from "lucide-react"
import { useThemeSettings } from "@/components/theme/useThemeSettings"

interface StatCardsProps {
    stats: ActivityDashboardStats;
}

export function StatCards({ stats }: StatCardsProps) {
    const { settings } = useThemeSettings();
    
    // Map system accent to GlassCard/Sparkline compatible accents
    const systemAccent = settings.accent === "blue" ? "indigo" : settings.accent;

    const items = [
        {
            label: "Total Activities",
            value: stats.totalActivities.value.toLocaleString(),
            change: stats.totalActivities.change,
            icon: Activity,
            accent: systemAccent as "indigo" | "cyan" | "emerald" | "rose" | "amber" | "violet",
            data: stats.totalActivities.data
        },
        {
            label: "Active Users",
            value: stats.activeUsers.value.toLocaleString(),
            change: stats.activeUsers.change,
            icon: Users,
            accent: "emerald" as const,
            data: stats.activeUsers.data
        },
        {
            label: "Security Events",
            value: stats.securityEvents.value.toLocaleString(),
            change: stats.securityEvents.change,
            icon: ShieldAlert,
            accent: "rose" as const,
            data: stats.securityEvents.data
        },
        {
            label: "Blocked Users",
            value: stats.blockedUsers.value.toLocaleString(),
            change: stats.blockedUsers.change,
            icon: UserX,
            accent: "amber" as const,
            data: stats.blockedUsers.data
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, i) => (
                <GlassCard 
                    key={item.label} 
                    accent={item.accent} 
                    className="p-5"
                    transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                >
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="p-2 rounded-lg bg-slate-500/5 dark:bg-white/5 border border-slate-500/10 dark:border-white/10">
                                <item.icon className="w-5 h-5 text-slate-600 dark:text-white/60" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-mono text-slate-500 dark:text-white/40 uppercase tracking-widest leading-tight">{item.label}</p>
                                <p className="text-2xl font-mono font-black text-slate-900 dark:text-white tracking-tighter">{item.value}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Sparkline data={item.data} accent={item.accent} />
                            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-tighter">
                                <span className={item.change.startsWith('+') ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                                    {item.change}
                                </span>
                                <span className="text-slate-400 dark:text-white/20">vs prev. period</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    )
}

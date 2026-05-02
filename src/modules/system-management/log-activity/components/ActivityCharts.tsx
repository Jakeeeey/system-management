"use client"

import * as React from "react"
import { 
    AreaChart, Area, 
    BarChart, Bar, 
    PieChart, Pie, Cell,
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { GlassCard } from "@/components/command-center/GlassCard"
import { 
    TimelineData, 
    DistributionData, 
    TrendData, 
    SecurityEventData 
} from "../types/activity-log.types"

interface ChartsProps {
    timeline: TimelineData[];
    distribution: DistributionData[];
    trend: TrendData[];
    security: SecurityEventData[];
}

export function ActivityCharts({ timeline, distribution, trend, security }: ChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Activity Timeline */}
            <GlassCard className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-black font-mono text-slate-500 dark:text-white/40 uppercase tracking-widest mb-1">Activity_Timeline</h4>
                        <p className="text-[10px] text-slate-400 dark:text-white/20 uppercase font-mono">Last 24 hours</p>
                    </div>
                </div>
                <div className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeline}>
                            <defs>
                                <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorLogouts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorManagement" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" vertical={false} opacity={0.05} />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9, fontWeight: 'bold' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9, fontWeight: 'bold' }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', color: '#fff' }} 
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="logins" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLogins)" name="Logins" />
                            <Area type="monotone" dataKey="logouts" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorLogouts)" name="Logouts" />
                            <Area type="monotone" dataKey="management" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorManagement)" name="User Creation" />
                            <Area type="monotone" dataKey="recovery" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorRecovery)" name="Account Recovery" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Activity Distribution */}
            <GlassCard className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-black font-mono text-slate-500 dark:text-white/40 uppercase tracking-widest mb-1">Activity_Distribution</h4>
                        <p className="text-[10px] text-slate-400 dark:text-white/20 uppercase font-mono">By event type</p>
                    </div>
                </div>
                <div className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                            />
                            <Legend 
                                verticalAlign="middle" 
                                align="right" 
                                layout="vertical" 
                                iconType="circle"
                                formatter={(value, entry) => (
                                    <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                        {value} {(entry as { payload?: { value?: number } })?.payload?.value ?? 0}%
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Daily Activity Trend */}
            <GlassCard className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-black font-mono text-slate-500 dark:text-white/40 uppercase tracking-widest mb-1">Daily_Activity_Trend</h4>
                        <p className="text-[10px] text-slate-400 dark:text-white/20 uppercase font-mono">Last 7 days</p>
                    </div>
                </div>
                <div className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" vertical={false} opacity={0.05} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9, fontWeight: 'bold' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9, fontWeight: 'bold' }} />
                            <Tooltip 
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                                contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                            />
                            <Bar 
                                dataKey="value" 
                                radius={[4, 4, 0, 0]} 
                                fill="url(#barGradient)"
                            >
                                {trend.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fillOpacity={0.8} />
                                ))}
                            </Bar>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#c084fc" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Security Events Trend */}
            <GlassCard className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-black font-mono text-slate-500 dark:text-white/40 uppercase tracking-widest mb-1">Security_Events</h4>
                        <p className="text-[10px] text-slate-400 dark:text-white/20 uppercase font-mono">Last 7 days</p>
                    </div>
                </div>
                <div className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={security}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" vertical={false} opacity={0.05} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9, fontWeight: 'bold' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9, fontWeight: 'bold' }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>{value}</span>} />
                            <Line type="monotone" dataKey="failed" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                            <Line type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                            <Line type="monotone" dataKey="suspicious" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
    )
}

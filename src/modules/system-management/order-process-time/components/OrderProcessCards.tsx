"use client";

import * as React from "react";
import { GlassCard } from "@/components/command-center/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    OrderProcessTime,
    ORDER_PROCESS_CATEGORIES,
    formatMinutesToHuman,
} from "../types/order-process-time.types";
import { AccountUser } from "../../account-management/types/account.types";
import {
    Clock,
    UserCheck,
    Pencil,
    Plus,
    Minus,
    CheckCircle2,
    AlertCircle,
    FilePlus2,
    ClipboardCheck,
    FileSpreadsheet,
    PackageSearch,
    SearchCheck,
    Receipt,
    BadgePercent,
    Truck,
} from "lucide-react";

interface OrderProcessCardsProps {
    data: OrderProcessTime[];
    users: AccountUser[];
    onUpdateMinutes: (id: number, minutes: number) => Promise<boolean>;
    onAssignUser: (id: number, userId: number | null) => Promise<boolean>;
    onOpenEditModal: (stage: OrderProcessTime) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    sales_order_creation: FilePlus2,
    sales_order_approval: ClipboardCheck,
    pdp_creation: FileSpreadsheet,
    picking: PackageSearch,
    auditing: SearchCheck,
    invoicing: Receipt,
    budgeting: BadgePercent,
    dispatching: Truck,
};

const ACCENTS: ("indigo" | "cyan" | "emerald" | "amber" | "rose" | "violet")[] = [
    "indigo",
    "cyan",
    "emerald",
    "amber",
    "rose",
    "violet",
];

export function OrderProcessCards({
    data,
    users,
    onUpdateMinutes,
    onAssignUser,
    onOpenEditModal,
}: OrderProcessCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {data.map((stage, idx) => {
                const IconComponent = CATEGORY_ICONS[stage.categoryKey] || Clock;
                const accent = ACCENTS[idx % ACCENTS.length];
                const meta = ORDER_PROCESS_CATEGORIES.find((c) => c.key === stage.categoryKey);

                return (
                    <GlassCard
                        key={stage.id}
                        accent={accent}
                        className="p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl group"
                    >
                        {/* Card Header */}
                        <div className="space-y-3.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                                            Stage {stage.stageNumber} of 8
                                        </span>
                                        <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                            {stage.categoryName}
                                        </h4>
                                    </div>
                                </div>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => onOpenEditModal(stage)}
                                    className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 shrink-0"
                                    title="Edit Stage Details"
                                >
                                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                                </Button>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">
                                {stage.description || meta?.description || "Standard order pipeline stage duration."}
                            </p>

                            {/* Target Time Display with Quick Adjusters */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Target Time
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="text-[11px] font-mono font-black bg-primary/10 text-primary border-primary/20 px-2 py-0.5"
                                    >
                                        {formatMinutesToHuman(stage.targetMinutes)}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/40 dark:border-white/5">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                onUpdateMinutes(
                                                    stage.id,
                                                    Math.max(5, stage.targetMinutes - 15)
                                                )
                                            }
                                            disabled={stage.targetMinutes <= 5}
                                            className="h-7 w-7 p-0 rounded-lg text-xs"
                                            title="Minus 15 minutes"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                onUpdateMinutes(stage.id, stage.targetMinutes + 15)
                                            }
                                            className="h-7 w-7 p-0 rounded-lg text-xs"
                                            title="Add 15 minutes"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                                        {stage.targetMinutes} minutes
                                    </span>
                                </div>
                            </div>

                            {/* Accountable Person Section */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                        <UserCheck className="w-3 h-3 text-emerald-500" />
                                        Accountable
                                    </span>
                                    {stage.accountableUser ? (
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Assigned
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Unassigned
                                        </span>
                                    )}
                                </div>

                                <Select
                                    value={
                                        stage.accountableUserId
                                            ? String(stage.accountableUserId)
                                            : "unassigned"
                                    }
                                    onValueChange={(val) =>
                                        onAssignUser(
                                            stage.id,
                                            val === "unassigned" ? null : Number(val)
                                        )
                                    }
                                >
                                    <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-slate-800/80 border-slate-200/70 dark:border-white/10 text-xs font-medium">
                                        <SelectValue placeholder="Assign Person..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 dark:border-white/10 max-h-56">
                                        <SelectItem
                                            value="unassigned"
                                            className="text-xs text-slate-400"
                                        >
                                            -- Unassigned --
                                        </SelectItem>
                                        {users.map((u) => (
                                            <SelectItem
                                                key={u.id}
                                                value={String(u.id)}
                                                className="text-xs"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-5 w-5 rounded-full">
                                                        <AvatarImage
                                                            src={u.image || ""}
                                                            alt={u.fullName}
                                                        />
                                                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                                            {u.fullName.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="truncate">{u.fullName}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Card Footer / User Chip */}
                        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
                            {stage.accountableUser ? (
                                <div className="flex items-center gap-2 truncate">
                                    <Avatar className="h-6 w-6 rounded-full border border-primary/20">
                                        <AvatarImage
                                            src={stage.accountableUser.image || ""}
                                            alt={stage.accountableUser.fullName}
                                        />
                                        <AvatarFallback className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold">
                                            {stage.accountableUser.fullName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                        {stage.accountableUser.fullName}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-slate-400 italic text-xs">
                                    No designated owner
                                </span>
                            )}

                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                #{stage.categoryKey}
                            </span>
                        </div>
                    </GlassCard>
                );
            })}
        </div>
    );
}

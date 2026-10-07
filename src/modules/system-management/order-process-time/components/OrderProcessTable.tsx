"use client";

import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    formatMinutesToHuman,
} from "../types/order-process-time.types";
import { AccountUser } from "../../account-management/types/account.types";
import { Pencil, Search } from "lucide-react";

interface OrderProcessTableProps {
    data: OrderProcessTime[];
    users: AccountUser[];
    onUpdateMinutes?: (id: number, minutes: number) => Promise<boolean>;
    onAssignUser: (id: number, userId: number | null) => Promise<boolean>;
    onOpenEditModal: (stage: OrderProcessTime) => void;
}

export function OrderProcessTable({
    data,
    users,
    onAssignUser,
    onOpenEditModal,
}: OrderProcessTableProps) {
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredData = React.useMemo(() => {
        if (!searchTerm.trim()) return data;
        const q = searchTerm.toLowerCase();
        return data.filter(
            (item) =>
                item.categoryName.toLowerCase().includes(q) ||
                item.categoryKey.toLowerCase().includes(q) ||
                (item.accountableUser?.fullName || "").toLowerCase().includes(q)
        );
    }, [data, searchTerm]);

    return (
        <div className="space-y-4">
            {/* Table Search Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search stage or assigned person..."
                        className="pl-9 h-11 rounded-xl bg-white dark:bg-slate-900/50 border-slate-200/70 dark:border-white/10 text-xs"
                    />
                </div>
                <span className="text-xs font-semibold text-slate-400 hidden sm:block">
                    Showing {filteredData.length} of {data.length} stages
                </span>
            </div>

            {/* Table Container */}
            <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 overflow-hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/40">
                        <TableRow className="border-b border-slate-200/60 dark:border-white/10">
                            <TableHead className="w-[80px] text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Stage
                            </TableHead>
                            <TableHead className="min-w-[200px] text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Category Name
                            </TableHead>
                            <TableHead className="min-w-[150px] text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Target SLA (Time)
                            </TableHead>
                            <TableHead className="min-w-[220px] text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Accountable Person
                            </TableHead>
                            <TableHead className="w-[100px] text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Status
                            </TableHead>
                            <TableHead className="w-[80px] text-right text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Action
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                                    No order process stages matched your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((stage) => (
                                <TableRow
                                    key={stage.id}
                                    className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                                >
                                    <TableCell className="font-mono text-xs font-black text-slate-400">
                                        #{stage.stageNumber}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                                                {stage.categoryName}
                                            </p>
                                            <code className="text-[11px] font-mono text-slate-400">
                                                {stage.categoryKey}
                                            </code>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="bg-primary/10 text-primary border-primary/20 text-xs font-mono font-bold"
                                            >
                                                {formatMinutesToHuman(stage.targetMinutes)}
                                            </Badge>
                                            <span className="text-[11px] font-mono text-slate-400">
                                                ({stage.targetMinutes}m)
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-full max-w-[240px]">
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
                                                <SelectTrigger className="h-9 rounded-xl bg-white dark:bg-slate-800/80 border-slate-200/70 dark:border-white/10 text-xs">
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
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] font-bold uppercase tracking-wider ${
                                                stage.isActive
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                            }`}
                                        >
                                            {stage.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => onOpenEditModal(stage)}
                                            className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"
                                        >
                                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

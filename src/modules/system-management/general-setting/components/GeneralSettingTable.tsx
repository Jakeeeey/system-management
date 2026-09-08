"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
    Search,
    Sliders,
    Pencil,
    ChevronLeft,
    ChevronRight,
    Globe,
    Cpu,
    ShieldAlert,
    FileCode2,
    Calendar,
} from "lucide-react";
import { GeneralSetting, SettingCategory } from "../types/general-setting.types";
import { cn } from "@/lib/utils";

interface GeneralSettingTableProps {
    data: GeneralSetting[];
    isLoading: boolean;
    onToggle: (setting: GeneralSetting) => Promise<boolean>;
    onOpenEditModal: (setting: GeneralSetting) => void;
}

const CATEGORY_META: Record<
    SettingCategory,
    { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
    localization: {
        label: "Localization",
        icon: Globe,
        color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    },
    attendance_hardware: {
        label: "Hardware & Attendance",
        icon: Cpu,
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    payroll_governance: {
        label: "Payroll Governance",
        icon: ShieldAlert,
        color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
    system: {
        label: "System",
        icon: FileCode2,
        color: "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20",
    },
};

export function GeneralSettingTable({
    data,
    isLoading,
    onToggle,
    onOpenEditModal,
}: GeneralSettingTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [togglingId, setTogglingId] = React.useState<number | null>(null);

    const filteredData = React.useMemo(() => {
        if (!searchQuery.trim()) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(
            (s) =>
                s.settingKey.toLowerCase().includes(q) ||
                s.title.toLowerCase().includes(q) ||
                s.settingValue.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q)
        );
    }, [data, searchQuery]);

    const columns: ColumnDef<GeneralSetting>[] = [
        {
            accessorKey: "settingKey",
            header: "Setting Key & Name",
            cell: ({ row }) => {
                const setting = row.original;
                const catInfo = CATEGORY_META[setting.category] || CATEGORY_META.system;
                const Icon = catInfo.icon;
                return (
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-sm font-bold text-slate-900 dark:text-white block">
                                {setting.title}
                            </span>
                            <code className="text-[11px] font-mono text-slate-400 block">
                                {setting.settingKey}
                            </code>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {
                const cat = row.original.category;
                const info = CATEGORY_META[cat] || CATEGORY_META.system;
                return (
                    <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md", info.color)}>
                        {info.label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "settingValue",
            header: "Value / Status",
            cell: ({ row }) => {
                const setting = row.original;
                const isToggling = togglingId === setting.id;

                if (setting.isBoolean) {
                    return (
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={setting.booleanValue}
                                disabled={isToggling}
                                onCheckedChange={async () => {
                                    setTogglingId(setting.id);
                                    await onToggle(setting);
                                    setTogglingId(null);
                                }}
                            />
                            <span className={cn(
                                "text-xs font-bold font-mono",
                                setting.booleanValue ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                            )}>
                                {setting.booleanValue ? "1 (Enabled)" : "0 (Disabled)"}
                            </span>
                        </div>
                    );
                }

                return (
                    <Badge
                        variant="secondary"
                        className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs px-2.5 py-1 rounded-lg max-w-[200px] truncate"
                    >
                        {setting.settingValue}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "updatedAt",
            header: "Last Modified",
            cell: ({ row }) => {
                const updated = row.original.updatedAt || row.original.createdAt;
                if (!updated) return <span className="text-xs text-slate-400">—</span>;

                let formatted = updated;
                try {
                    formatted = new Date(updated).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                } catch {
                    formatted = updated;
                }

                return (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatted}</span>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                const setting = row.original;
                return (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenEditModal(setting)}
                        className="h-8 px-3 rounded-lg border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold uppercase tracking-wider"
                    >
                        <Pencil className="w-3 h-3 mr-1.5" />
                        Edit
                    </Button>
                );
            },
        },
    ];

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
        initialState: { pagination: { pageSize: 10 } },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
                    <Sliders className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-white/60">
                    Configuration Registry Table
                </h3>
            </div>

            <div className="overflow-hidden bg-white/50 dark:bg-slate-950/20 backdrop-blur-md rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl">
                <div className="p-6 border-b border-slate-200/50 dark:border-white/5">
                    <div className="relative group max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-primary transition-all" />
                        <Input
                            placeholder="Search setting key, label, or value..."
                            className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-white/5 pl-12 h-12 text-sm text-slate-800 dark:text-white rounded-2xl focus-visible:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-auto px-4">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-transparent hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-[10px] font-black uppercase tracking-widest text-slate-400/80 h-14">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-slate-100 dark:border-white/5">
                                        <TableCell colSpan={columns.length}>
                                            <div className="flex items-center gap-3 py-2">
                                                <Skeleton className="h-10 w-10 rounded-lg" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-48" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-primary/5 transition-all group"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-4">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Sliders className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                            <p className="text-sm font-semibold text-slate-500">No settings found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/50 dark:border-white/5">
                    <span className="text-xs font-medium text-slate-400">
                        Total {filteredData.length} setting{filteredData.length === 1 ? "" : "s"}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 rounded-lg border-slate-200 dark:border-white/10"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-8 rounded-lg border-slate-200 dark:border-white/10"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

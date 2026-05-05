"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    History,
    Key,
    Mail,
    Shield,
    Calendar,
    Filter,
    Layers,
    Ban,
    HelpCircle,
    LogIn,
    LogOut,
    UserCheck,
    UserX,
    Clock,
    Lock,
} from "lucide-react"
import { ActivityLogEntry } from "../types/activity-log.types"
import { cn } from "@/lib/utils"

interface ActivityLogTableProps {
    data: ActivityLogEntry[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    counts?: Record<string, number>;
}

const TABS = [
    "All Activities",
    "LOGIN",
    "LOGOUT",
    "BLOCK",
    "UNBLOCK",
    "FORCE_RESET",
    "RESET_EMAIL",
    "FORGOT_PASSWORD",
    "VERIFY_OTP",
    "CHANGE_PASSWORD",
    "CREATE_USER",
    "UPDATE_USER",
    "DELETE_USER"
];

export function ActivityLogTable({
    data,
    activeTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    counts = {}
}: ActivityLogTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 8,
    });

    const PAGE_SIZE_OPTIONS = [5, 8, 10, 25, 50, 100];

    const columns: ColumnDef<ActivityLogEntry>[] = [
        {
            accessorKey: "userName",
            header: "User",
            cell: ({ row }) => {
                const entry = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-white/10">
                            <AvatarImage src={entry.userAvatar} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-[10px] text-white font-bold">
                                {entry.userName ? entry.userName.split(' ').map(n => n[0]).join('') : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">{entry.userName}</span>
                            <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono mt-0.5">{entry.userEmail}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "type",
            header: "Activity",
            cell: ({ row }) => {
                const type = row.getValue("type") as string;
                type IconConfig = { icon: React.ElementType; color: string; bg: string };
                const IconMap: Record<string, IconConfig> = {
                    'LOGIN': { icon: LogIn, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    'LOGOUT': { icon: LogOut, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                    'BLOCK': { icon: Ban, color: 'text-rose-600', bg: 'bg-rose-600/10' },
                    'UNBLOCK': { icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
                    'FORCE_RESET': { icon: Key, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    'PASSWORD_RESET': { icon: Key, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    'RESET_EMAIL': { icon: Mail, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    'FORGOT_PASSWORD': { icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    'VERIFY_OTP': { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    'CHANGE_PASSWORD': { icon: Lock, color: 'text-teal-500', bg: 'bg-teal-500/10' },
                    'CREATE_USER': { icon: UserCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
                    'UPDATE_USER': { icon: History, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                    'DELETE_USER': { icon: UserX, color: 'text-red-500', bg: 'bg-red-500/10' },
                    'TIMEOUT': { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    'SECURITY_ALERT': { icon: Shield, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                };
                const config = IconMap[type] || IconMap['LOGIN'];
                return (
                    <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-md", config.bg)}>
                            <config.icon className={cn("w-3 h-3", config.color)} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-white/80">{type.replace(/_/g, ' ')}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "timestamp",
            header: "Timestamp",
            cell: ({ row }) => {
                const timestamp = row.getValue("timestamp") as string;
                try {
                    const date = new Date(timestamp);
                    const formattedDate = new Intl.DateTimeFormat('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true
                    }).format(date);

                    return (
                        <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold text-slate-800 dark:text-white/90">{formattedDate}</span>
                        </div>
                    );
                } catch {
                    return (
                        <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold text-slate-800 dark:text-white/90">{timestamp}</span>
                        </div>
                    );
                }
            }
        },

        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => {
                const entry = row.original;
                return (
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 dark:text-white/80">{entry.location || "Unknown Location"}</span>
                        <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono italic">{entry.ipAddress}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "reason",
            header: "Reason",
            cell: ({ row }) => {
                const reason = row.getValue("reason") as string;
                return (
                    <span className="text-xs text-slate-500 dark:text-white/50 italic max-w-[200px] truncate block">
                        {reason || "—"}
                    </span>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;

                const getStatusStyles = (s: string) => {
                    switch (s) {
                        case 'SUCCESS':
                            return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                        case 'FAILED':
                        case 'BLOCKED':
                            return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
                        case 'WARNING':
                            return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                        default:
                            return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/10";
                    }
                };

                return (
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[9px] font-black uppercase py-0 px-2 rounded-full border",
                            getStatusStyles(status)
                        )}
                    >
                        {status}
                    </Badge>
                );
            }
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: setPagination,
        state: {
            sorting,
            pagination,
        },
    });

    const getVisiblePages = (currentPage: number, totalPages: number) => {
        const maxVisible = 7; // Show up to 7 pages
        if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i);
        if (currentPage <= 3) return Array.from({ length: maxVisible }, (_, i) => i);
        if (currentPage >= totalPages - 4) return Array.from({ length: maxVisible }, (_, i) => totalPages - maxVisible + i);
        return Array.from({ length: maxVisible }, (_, i) => currentPage - 3 + i);
    };

    const visiblePages = getVisiblePages(table.getState().pagination.pageIndex, table.getPageCount());

    return (
        <div className="space-y-4">
            {/* Table Header / Registry Title */}
            <div className="flex items-center gap-2 px-1">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.1)]">
                    <Layers className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-white/60">Activity Logs Registry</h3>
            </div>

            <div className="overflow-hidden border-none shadow-sm flex flex-col bg-white/50 dark:bg-slate-950/20 backdrop-blur-sm rounded-3xl border border-slate-200/50 dark:border-white/5">
                {/* Minimal Header Area */}
                <div className="p-4 border-b border-slate-200/50 dark:border-white/5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative group max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search activity..."
                                className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-white/5 pl-10 focus-visible:ring-primary/30 text-xs h-9 text-slate-800 dark:text-white rounded-xl"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-9 text-xs text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl">
                                <Calendar className="w-3.5 h-3.5 mr-2" /> Last 30 days
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 text-xs text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl">
                                <Filter className="w-3.5 h-3.5 mr-2" /> Filters
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => onTabChange(tab)}
                                    className={cn(
                                        "h-7 px-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                                    )}
                                >
                                    {tab.replace(/_/g, ' ')}
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "border-none px-1.5 h-3.5 text-[9px] min-w-[1.25rem] flex items-center justify-center font-bold transition-all rounded-md",
                                            isActive
                                                ? "bg-primary-foreground/20 text-primary-foreground"
                                                : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                        )}
                                    >
                                        {counts[tab] || 0}
                                    </Badge>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 min-h-0 overflow-auto px-2">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-slate-200/50 dark:border-white/5 hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 h-10 py-0">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="border-slate-200/50 dark:border-white/10 hover:bg-slate-100/50 dark:hover:bg-primary/5 transition-colors group"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-2">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-32 text-center">
                                        <p className="text-xs font-mono text-slate-400 uppercase italic">No_Records_Found</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {table.getRowModel().rows.length} of {data.length} Activities • Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Rows per page</span>
                            <Select
                                value={String(pagination.pageSize)}
                                onValueChange={(val: string) => {
                                    const next = Number(val);
                                    table.setPageSize(next);
                                }}
                            >
                                <SelectTrigger className="h-7 w-16 text-[10px] font-black uppercase tracking-widest rounded-lg border-slate-200/60 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 focus:ring-primary/30">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="text-[10px] font-black uppercase">
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <SelectItem key={size} value={String(size)} className="text-[10px] font-black uppercase tracking-widest cursor-pointer">
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={!table.getCanPreviousPage()}
                            onClick={() => table.previousPage()}
                            className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-primary"
                        >
                            Prev
                        </Button>
                        <div className="flex items-center gap-1.5">
                            {visiblePages.map((pageIndex) => (
                                <button
                                    key={pageIndex}
                                    onClick={() => table.setPageIndex(pageIndex)}
                                    className={cn(
                                        "h-6 w-6 rounded-lg text-[10px] font-black transition-all",
                                        table.getState().pagination.pageIndex === pageIndex
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                            : "text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                                    )}
                                >
                                    {pageIndex + 1}
                                </button>
                            ))}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={!table.getCanNextPage()}
                            onClick={() => table.nextPage()}
                            className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-primary"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

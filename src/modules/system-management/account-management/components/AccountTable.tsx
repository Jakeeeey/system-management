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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    MoreVertical,
    Eye,
    Key,
    Mail,
    Lock,
    Filter,
    Layers,
    Ban,
    CheckCircle2,
    Clock,
} from "lucide-react"
import { AccountUser, AccountAction } from "../types/account.types"
import { cn } from "@/lib/utils"

interface AccountTableProps {
    data: AccountUser[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAction: (action: AccountAction, user: AccountUser) => void;
    counts?: Record<string, number>;
}

const TABS = [
    "All Users",
    "Active",
    "Blocked",
    "Locked"
];

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = React.useState<string>("");

    React.useEffect(() => {
        const calculateTime = () => {
            const target = new Date(targetDate.replace(' ', 'T') + (targetDate.endsWith('Z') ? '' : 'Z'));
            const now = new Date();
            const diff = target.getTime() - now.getTime();

            if (diff <= 0) return "Expired";

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
            return `${minutes}m ${seconds}s`;
        };

        setTimeLeft(calculateTime());
        const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="flex items-center gap-1 mt-1 animate-pulse">
            <Clock className="w-2.5 h-2.5 text-amber-500" />
            <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400">
                {timeLeft}
            </span>
        </div>
    );
};

export function AccountTable({
    data,
    activeTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    onAction,
    counts = {}
}: AccountTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const columns: ColumnDef<AccountUser>[] = [
        {
            accessorKey: "fullName",
            header: "User",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white/10 shadow-sm">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-xs text-white font-black">
                                {user.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{user.fullName}</span>
                            <span className="text-[11px] text-slate-500 dark:text-white/40 font-mono mt-1 italic">{user.email}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "position",
            header: "Position",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-white/80">{row.getValue("position")}</span>
                </div>
            )
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as string;
                return (
                    <Badge variant="outline" className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                        role === 'ADMIN' ? "bg-purple-500/10 text-purple-600 border-purple-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    )}>
                        {role}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                const user = row.original;
                const getStatusStyles = (s: string) => {
                    switch (s) {
                        case 'ACTIVE':
                            return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                        case 'BLOCKED':
                            return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
                        case 'LOCKED':
                            return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                        default:
                            return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/10";
                    }
                };

                return (
                    <div className="flex flex-col">
                        <Badge variant="outline" className={cn(
                            "text-[9px] font-black uppercase py-0 px-2 rounded-full border w-fit",
                            getStatusStyles(status)
                        )}>
                            {status}
                        </Badge>
                        {status === 'LOCKED' && user.lockUntil && (
                            <CountdownTimer targetDate={user.lockUntil} />
                        )}
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-1.5 transition-opacity group-hover:opacity-100 opacity-60">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 rounded-xl border flex items-center justify-center transition-all",
                                user.isBlocked
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 shadow-emerald-500/10"
                                    : "bg-rose-500/5 border-rose-500/20 text-rose-500 hover:bg-rose-500/20 shadow-rose-500/10"
                            )}
                            onClick={() => onAction(user.isBlocked ? 'UNBLOCK' : 'BLOCK', user)}
                            title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                            {user.isBlocked ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 rounded-xl"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl">
                                <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-500 px-2 py-1.5">User Management</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => onAction('VIEW_HISTORY', user)}>
                                    <Eye className="w-3.5 h-3.5 mr-2" /> Activity History
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => onAction('FORCE_RESET', user)}>
                                    <Key className="w-3.5 h-3.5 mr-2 text-purple-500" /> Force Password Reset
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => onAction('SEND_RESET', user)}>
                                    <Mail className="w-3.5 h-3.5 mr-2 text-fuchsia-500" /> Send Reset Email
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => onAction('DIRECT_CHANGE', user)}>
                                    <Lock className="w-3.5 h-3.5 mr-2 text-rose-500" /> Direct Change Password
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
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
            <div className="flex items-center gap-2 px-1">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
                    <Layers className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-white/60">Account Management Registry</h3>
            </div>

            <div className="overflow-hidden bg-white/50 dark:bg-slate-950/20 backdrop-blur-md rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl">
                <div className="p-6 border-b border-slate-200/50 dark:border-white/5 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative group max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-primary transition-all" />
                            <Input
                                placeholder="Search by name, email, or position..."
                                className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-white/5 pl-12 h-12 text-sm text-slate-800 dark:text-white rounded-2xl focus-visible:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" className="h-12 px-5 text-xs font-bold text-slate-500 hover:bg-primary/5 rounded-2xl border border-transparent hover:border-primary/10">
                                <Filter className="w-4 h-4 mr-2" /> Advanced Filters
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => onTabChange(tab)}
                                    className={cn(
                                        "h-10 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                                    )}
                                >
                                    {tab}
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "border-none px-2 h-4.5 text-[9px] min-w-[1.5rem] flex items-center justify-center font-black rounded-lg",
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
                            {table.getRowModel().rows?.length ? (
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
                                            <Search className="w-8 h-8 text-slate-200" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No users found matching your criteria</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-6 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows per page:</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-14 text-[10px] font-black bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                                        {table.getState().pagination.pageSize}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="min-w-[4rem] bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-xl">
                                    {[5, 10, 20, 30, 40, 50].map((size) => (
                                        <DropdownMenuItem
                                            key={size}
                                            className="text-[10px] font-black cursor-pointer justify-center"
                                            onClick={() => table.setPageSize(size)}
                                        >
                                            {size}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Displaying {table.getRowModel().rows.length} of {data.length} Users • Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={!table.getCanPreviousPage()}
                            onClick={() => table.previousPage()}
                            className="h-10 px-4 text-[10px] font-black uppercase text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl"
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1.5">
                            {visiblePages.map((pageIndex) => (
                                <button
                                    key={pageIndex}
                                    onClick={() => table.setPageIndex(pageIndex)}
                                    className={cn(
                                        "h-8 w-8 rounded-xl text-[10px] font-black transition-all",
                                        table.getState().pagination.pageIndex === pageIndex
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
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
                            className="h-10 px-4 text-[10px] font-black uppercase text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

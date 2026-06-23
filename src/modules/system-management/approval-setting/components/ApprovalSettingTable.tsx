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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Search,
    Layers,
    ShieldCheck,
    ShieldOff,
} from "lucide-react"
import { ApprovalSetting } from "../types/approval-setting.types"
import { cn } from "@/lib/utils"

interface ApprovalSettingTableProps {
    data: ApprovalSetting[]
    isLoading: boolean
    onToggle: (id: number, currentValue: boolean) => Promise<boolean>
}

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    "Layers": Layers,
    "ShieldCheck": ShieldCheck,
    "ShieldOff": ShieldOff,
}

export function ApprovalSettingTable({ data, isLoading, onToggle }: ApprovalSettingTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [togglingId, setTogglingId] = React.useState<number | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredData = React.useMemo(() => {
        if (!searchQuery.trim()) return data
        const q = searchQuery.toLowerCase()
        return data.filter(s => s.moduleName.toLowerCase().includes(q))
    }, [data, searchQuery])

    const columns: ColumnDef<ApprovalSetting>[] = [
        {
            accessorKey: "moduleName",
            header: "Module",
            cell: ({ row }) => {
                const ModuleIcon = MODULE_ICONS["Layers"]
                return (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <ModuleIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {row.original.moduleName}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: "isApproval",
            header: "Status",
            cell: ({ row }) => {
                const enabled = row.original.isApproval
                return (
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md",
                            enabled
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20"
                        )}
                    >
                        <div className="flex items-center gap-1.5">
                            {enabled ? (
                                <ShieldCheck className="w-3 h-3" />
                            ) : (
                                <ShieldOff className="w-3 h-3" />
                            )}
                            {enabled ? "Enabled" : "Disabled"}
                        </div>
                    </Badge>
                )
            },
        },
        {
            id: "toggle",
            header: "Toggle Approval",
            cell: ({ row }) => {
                const setting = row.original
                const isToggling = togglingId === setting.id
                return (
                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={setting.isApproval}
                            disabled={isToggling}
                            onCheckedChange={async () => {
                                setTogglingId(setting.id)
                                await onToggle(setting.id, setting.isApproval)
                                setTogglingId(null)
                            }}
                        />
                        {isToggling && (
                            <span className="text-[10px] font-mono text-slate-400 animate-pulse">
                                saving...
                            </span>
                        )}
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
        initialState: { pagination: { pageSize: 10 } },
    })

    const getVisiblePages = (currentPage: number, totalPages: number) => {
        const maxVisible = 7
        if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i)
        if (currentPage <= 3) return Array.from({ length: maxVisible }, (_, i) => i)
        if (currentPage >= totalPages - 4) return Array.from({ length: maxVisible }, (_, i) => totalPages - maxVisible + i)
        return Array.from({ length: maxVisible }, (_, i) => currentPage - 3 + i)
    }

    const visiblePages = getVisiblePages(table.getState().pagination.pageIndex, table.getPageCount())

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
                    <Layers className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-white/60">
                    Approval Module Registry
                </h3>
            </div>

            <div className="overflow-hidden bg-white/50 dark:bg-slate-950/20 backdrop-blur-md rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl">
                <div className="p-6 border-b border-slate-200/50 dark:border-white/5">
                    <div className="relative group max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-primary transition-all" />
                        <Input
                            placeholder="Search by module name..."
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
                                            <Search className="w-8 h-8 text-slate-200" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                No approval settings found
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-6 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {table.getRowModel().rows.length} of {filteredData.length} Modules
                        {searchQuery && ` (filtered)`} &bull; Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
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

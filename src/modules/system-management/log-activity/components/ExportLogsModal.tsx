"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExportLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultDateRange: { from: Date | undefined; to: Date | undefined };
    onExport: (options: {
        dateRange: { from: Date | undefined; to: Date | undefined };
        activities: string[];
    }) => void;
}

const ACTIVITY_TYPES = [
    { label: "Login", value: "LOGIN" },
    { label: "Logout", value: "LOGOUT" },
    { label: "Block", value: "BLOCK" },
    { label: "Unblock", value: "UNBLOCK" },
    { label: "Force Reset", value: "FORCE_RESET" },
    { label: "Reset Email", value: "RESET_EMAIL" },
    { label: "Forgot Password", value: "FORGOT_PASSWORD" },
    { label: "Verify OTP", value: "VERIFY_OTP" },
    { label: "Change Password", value: "CHANGE_PASSWORD" },
    { label: "Create User", value: "CREATE_USER" },
    { label: "Update User", value: "UPDATE_USER" },
    { label: "Delete User", value: "DELETE_USER" },
];

export function ExportLogsModal({
    isOpen,
    onClose,
    defaultDateRange,
    onExport,
}: ExportLogsModalProps) {
    const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });

    const [selectedActivities, setSelectedActivities] = React.useState<string[]>(
        ACTIVITY_TYPES.map(a => a.value)
    );

    // Initialize with current dashboard date filter when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setDateRange(defaultDateRange);
            setSelectedActivities(ACTIVITY_TYPES.map(a => a.value));
        }
    }, [isOpen, defaultDateRange]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedActivities(ACTIVITY_TYPES.map(a => a.value));
        } else {
            setSelectedActivities([]);
        }
    };

    const handleToggleActivity = (value: string, checked: boolean) => {
        if (checked) {
            setSelectedActivities(prev => [...prev, value]);
        } else {
            setSelectedActivities(prev => prev.filter(v => v !== value));
        }
    };

    const isAllSelected = selectedActivities.length === ACTIVITY_TYPES.length;

    const handleExportClick = () => {
        onExport({
            dateRange,
            activities: selectedActivities,
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Download className="w-5 h-5 text-primary" />
                        Export Log Options
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Configure date range and select which activity registry records to include in the exported CSV document.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 my-4">
                    {/* Date Picker Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Range Filter</label>
                        <div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full h-11 justify-start text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-white/5 rounded-xl hover:bg-primary/5 hover:text-primary transition-all flex items-center gap-2 cursor-pointer",
                                            (dateRange.from || dateRange.to) && "border-primary/30 text-primary bg-primary/5"
                                        )}
                                    >
                                        <CalendarIcon className="w-4 h-4 mr-1 text-slate-400 group-hover:text-primary" />
                                        {dateRange.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Select Date Range (Defaults to All)</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[110]" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange.from}
                                        selected={{
                                            from: dateRange.from,
                                            to: dateRange.to
                                        }}
                                        onSelect={(range) => {
                                            setDateRange({
                                                from: range?.from,
                                                to: range?.to
                                            });
                                        }}
                                        numberOfMonths={2}
                                    />
                                    {(dateRange.from || dateRange.to) && (
                                        <div className="p-3 border-t border-slate-100 dark:border-white/5 flex justify-end bg-slate-50/50 dark:bg-slate-900/20">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 font-bold rounded-xl"
                                                onClick={() => setDateRange({ from: undefined, to: undefined })}
                                            >
                                                Clear Date Filter
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Checkboxes List Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Filters</label>
                            <div className="flex items-center gap-1.5">
                                <Checkbox
                                    id="select-all"
                                    checked={isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                />
                                <label
                                    htmlFor="select-all"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 cursor-pointer select-none"
                                >
                                    Select All
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-1">
                            {ACTIVITY_TYPES.map((act) => {
                                const isChecked = selectedActivities.includes(act.value);
                                return (
                                    <div key={act.value} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                                        <Checkbox
                                            id={`act-${act.value}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => handleToggleActivity(act.value, !!checked)}
                                        />
                                        <label
                                            htmlFor={`act-${act.value}`}
                                            className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                                        >
                                            {act.label}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-6 border-t border-slate-100 dark:border-white/5 pt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExportClick}
                        disabled={selectedActivities.length === 0}
                        className="text-xs font-black uppercase tracking-widest px-5 h-11 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] rounded-xl cursor-pointer disabled:opacity-50 disabled:scale-100"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

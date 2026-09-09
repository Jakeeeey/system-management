"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrderProcessTime, formatMinutesToHuman } from "../types/order-process-time.types";
import { AccountUser } from "../../account-management/types/account.types";
import { Clock, UserCheck, Save, Loader2, Sliders } from "lucide-react";

interface EditProcessTimeDialogProps {
    stage: OrderProcessTime | null;
    users: AccountUser[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (
        id: number,
        payload: {
            targetMinutes: number;
            accountableUserId: number | null;
            description?: string;
            isActive?: boolean;
        }
    ) => Promise<boolean>;
}

export function EditProcessTimeDialog({
    stage,
    users,
    open,
    onOpenChange,
    onSave,
}: EditProcessTimeDialogProps) {
    const [minutes, setMinutes] = React.useState<number>(30);
    const [selectedUserId, setSelectedUserId] = React.useState<string>("unassigned");
    const [description, setDescription] = React.useState<string>("");
    const [isActive, setIsActive] = React.useState<boolean>(true);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (stage) {
            setMinutes(stage.targetMinutes || 30);
            setSelectedUserId(stage.accountableUserId ? String(stage.accountableUserId) : "unassigned");
            setDescription(stage.description || "");
            setIsActive(stage.isActive);
        }
    }, [stage]);

    if (!stage) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const userId = selectedUserId === "unassigned" ? null : Number(selectedUserId);
        const success = await onSave(stage.id, {
            targetMinutes: Number(minutes) || 1,
            accountableUserId: userId,
            description,
            isActive,
        });
        setIsSaving(false);
        if (success) {
            onOpenChange(false);
        }
    };

    const selectedUser = users.find((u) => String(u.id) === selectedUserId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg rounded-3xl border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-6">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                Configure Stage {stage.stageNumber}
                            </DialogTitle>
                            <span className="text-xs font-bold text-primary">
                                {stage.categoryName}
                            </span>
                        </div>
                    </div>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                        Adjust target resolution timeframe (SLA) and designate the personnel accountable for this stage.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-3">
                    {/* Target Time Setting */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                Target Completion Time (Minutes)
                            </Label>
                            <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                                {formatMinutesToHuman(minutes)}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min={1}
                                max={10080}
                                value={minutes}
                                onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-white/10 text-sm font-semibold"
                                required
                            />
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                                Presets:
                            </span>
                            {[15, 30, 45, 60, 90, 120].map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setMinutes(preset)}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                        minutes === preset
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                                >
                                    {preset < 60 ? `${preset}m` : `${preset / 60}h`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Accountable Personnel Selector */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                            Accountable Person
                        </Label>

                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-white/10 text-sm">
                                <SelectValue placeholder="Choose accountable staff..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-white/10 max-h-64">
                                <SelectItem value="unassigned" className="text-xs text-slate-400 font-medium">
                                    -- Unassigned / Open Queue --
                                </SelectItem>
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={String(u.id)} className="text-xs py-2">
                                        <div className="flex items-center gap-2.5">
                                            <Avatar className="h-6 w-6 rounded-full">
                                                <AvatarImage src={u.image || ""} alt={u.fullName} />
                                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                                    {u.fullName.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                                                    {u.fullName}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {u.position || "Staff"} • {u.role || "User"}
                                                </p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedUser && (
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                                <Avatar className="h-8 w-8 rounded-full border border-emerald-500/20">
                                    <AvatarImage src={selectedUser.image || ""} alt={selectedUser.fullName} />
                                    <AvatarFallback className="text-xs bg-emerald-500/10 text-emerald-600 font-bold">
                                        {selectedUser.fullName.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {selectedUser.fullName}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate">
                                        {selectedUser.email}
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                    Accountable
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Stage Description */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            Workflow Description / Instructions
                        </Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add scope details or SLA operational rules..."
                            rows={3}
                            className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-white/10 text-xs resize-none"
                        />
                    </div>

                    {/* Active Switch */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Stage Active in Pipeline
                            </span>
                            <p className="text-[11px] text-slate-400">
                                When active, SLA countdowns are tracked during order lifecycles.
                            </p>
                        </div>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl text-xs font-bold uppercase tracking-wider"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-xl px-5 text-xs font-bold uppercase tracking-wider"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Configuration
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

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
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GeneralSetting, KNOWN_SETTINGS } from "../types/general-setting.types";
import { Loader2, Sliders, Save } from "lucide-react";

interface EditSettingDialogProps {
    setting: GeneralSetting | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (target: { id?: number; settingKey?: string }, value: string) => Promise<boolean>;
}

export function EditSettingDialog({
    setting,
    open,
    onOpenChange,
    onSave,
}: EditSettingDialogProps) {
    const [value, setValue] = React.useState("");
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (setting) {
            setValue(setting.settingValue);
        }
    }, [setting]);

    if (!setting) return null;

    const meta = KNOWN_SETTINGS[setting.settingKey];
    const isBool = setting.isBoolean;
    const isSelect = meta?.inputType === "select" && meta.options && meta.options.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const success = await onSave(
            { id: setting.id, settingKey: setting.settingKey },
            value
        );
        setIsSaving(false);
        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-6">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                {setting.title}
                            </DialogTitle>
                            <code className="text-[11px] font-mono text-slate-400">
                                {setting.settingKey}
                            </code>
                        </div>
                    </div>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                        {setting.description}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-3">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            Setting Value
                        </Label>

                        {isBool ? (
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    {value === "1" ? "Enabled (Active)" : "Disabled (Inactive)"}
                                </span>
                                <Switch
                                    checked={value === "1"}
                                    onCheckedChange={(checked) => setValue(checked ? "1" : "0")}
                                />
                            </div>
                        ) : isSelect && meta?.options ? (
                            <Select value={value} onValueChange={setValue}>
                                <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-white/10 text-sm font-medium">
                                    <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-white/10">
                                    {meta.options.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Enter value..."
                                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-white/10 text-sm font-medium"
                                required
                            />
                        )}
                    </div>

                    {setting.settingKey === "division_name" && (
                        <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs space-y-1">
                            <span className="font-bold text-blue-600 dark:text-blue-400">Live Preview:</span>
                            <p className="text-slate-600 dark:text-slate-300">
                                Modules will display as: <strong className="text-primary font-mono">{value || "Division"} Management</strong>
                            </p>
                        </div>
                    )}

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
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

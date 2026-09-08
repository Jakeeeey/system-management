"use client";

import * as React from "react";
import { GlassCard } from "@/components/command-center/GlassCard";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    GeneralSetting,
    KNOWN_SETTINGS,
} from "../types/general-setting.types";
import {
    Clock,
    Globe,
    Building2,
    Radio,
    ScanFace,
    Tag,
    Lock,
    ShieldAlert,
    Save,
    Pencil,
    CheckCircle2,
    XCircle,
    Sparkles,
    Cpu,
    FileCode2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GeneralSettingCardsProps {
    settings: GeneralSetting[];
    onToggle: (setting: GeneralSetting) => Promise<boolean>;
    onUpdate: (target: { id?: number; settingKey?: string }, value: string) => Promise<boolean>;
    onOpenEditModal: (setting: GeneralSetting) => void;
}

export function GeneralSettingCards({
    settings,
    onToggle,
    onUpdate,
    onOpenEditModal,
}: GeneralSettingCardsProps) {
    // Map settings by key for easy lookup
    const settingMap = React.useMemo(() => {
        const map = new Map<string, GeneralSetting>();
        settings.forEach((s) => map.set(s.settingKey, s));
        return map;
    }, [settings]);

    // State for local inline edit of division_name
    const divisionSetting = settingMap.get("division_name");
    const [divisionValue, setDivisionValue] = React.useState(
        divisionSetting?.settingValue || "Division"
    );
    const [isSavingDivision, setIsSavingDivision] = React.useState(false);

    React.useEffect(() => {
        if (divisionSetting) {
            setDivisionValue(divisionSetting.settingValue);
        }
    }, [divisionSetting]);

    // Live clock for selected timezone
    const timezoneSetting = settingMap.get("time_zone");
    const currentTimezone = timezoneSetting?.settingValue || "Asia/Manila";
    const [currentTimeString, setCurrentTimeString] = React.useState("");

    React.useEffect(() => {
        const updateClock = () => {
            try {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat("en-US", {
                    timeZone: currentTimezone,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                    timeZoneName: "short",
                });
                setCurrentTimeString(formatter.format(now));
            } catch {
                setCurrentTimeString(new Date().toLocaleTimeString());
            }
        };

        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, [currentTimezone]);

    const handleSaveDivision = async () => {
        if (!divisionSetting) return;
        setIsSavingDivision(true);
        await onUpdate(
            { id: divisionSetting.id, settingKey: "division_name" },
            divisionValue
        );
        setIsSavingDivision(false);
    };

    const handleTimezoneChange = async (newTz: string) => {
        if (!timezoneSetting) {
            await onUpdate({ settingKey: "time_zone" }, newTz);
        } else {
            await onUpdate({ id: timezoneSetting.id, settingKey: "time_zone" }, newTz);
        }
    };

    // Hardware Attendance Items
    const rfidAttendance = settingMap.get("rfid_attendance");
    const faceAttendance = settingMap.get("face_attendance");
    const rfidTagging = settingMap.get("rfid_asset_tagging");

    // Payroll Read-Only Items
    const payrollEmpReadOnly = settingMap.get("payroll_employee_management_read_only");
    const payrollDeptReadOnly = settingMap.get("payroll_department_management_read_only");

    // Other/custom settings
    const standardKeys = new Set([
        "time_zone",
        "division_name",
        "rfid_attendance",
        "face_attendance",
        "rfid_asset_tagging",
        "payroll_employee_management_read_only",
        "payroll_department_management_read_only",
    ]);
    const otherSettings = settings.filter((s) => !standardKeys.has(s.settingKey));

    return (
        <div className="space-y-8">
            {/* 1. Localization & Nomenclature Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-1">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Globe className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
                            Localization & Nomenclature
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Time reference settings and organization-wide terminology standards.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Timezone Card */}
                    <GlassCard accent="cyan" className="p-6">
                        <div className="flex flex-col h-full justify-between gap-5">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                                System Timezone
                                            </h4>
                                            <code className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                                                time_zone
                                            </code>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                                        System-Wide
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Defines the baseline timezone for time stamps, audit logs, and attendance clocks across all modules.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Current Local Clock
                                    </span>
                                    <p className="text-lg font-black font-mono tracking-tight text-slate-900 dark:text-white">
                                        {currentTimeString || "Loading..."}
                                    </p>
                                </div>
                                <Sparkles className="w-5 h-5 text-cyan-500/50" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    Select Active Timezone
                                </label>
                                <Select
                                    value={currentTimezone}
                                    onValueChange={handleTimezoneChange}
                                >
                                    <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800/80 border-slate-200/70 dark:border-white/10 text-xs font-semibold">
                                        <SelectValue placeholder="Select Timezone" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 dark:border-white/10 max-h-60">
                                        {KNOWN_SETTINGS.time_zone.options?.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Division Name Card */}
                    <GlassCard accent="indigo" className="p-6">
                        <div className="flex flex-col h-full justify-between gap-5">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                                Division Nomenclature
                                            </h4>
                                            <code className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                                                division_name
                                            </code>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
                                        Terminology
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Overrides the organizational label for “Division” (e.g. &apos;Sangguniang Bayan&apos; or &apos;Division&apos;) in HR and structure pages.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Live UI Header Simulation
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Nav Display:
                                    </span>
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-mono text-xs px-2.5 py-0.5">
                                        {divisionValue || "Division"} Management
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    Nomenclature Value
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={divisionValue}
                                        onChange={(e) => setDivisionValue(e.target.value)}
                                        placeholder="e.g. Sangguniang Bayan or Division"
                                        className="h-11 rounded-xl bg-white dark:bg-slate-800/80 border-slate-200/70 dark:border-white/10 text-xs font-semibold"
                                    />
                                    <Button
                                        onClick={handleSaveDivision}
                                        disabled={isSavingDivision || divisionValue === divisionSetting?.settingValue}
                                        className="h-11 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0"
                                    >
                                        <Save className="w-4 h-4 mr-1.5" />
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* 2. Attendance & Hardware Capabilities */}
            <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-1">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
                            Attendance & Hardware Integrations
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Physical terminal protocols, biometric scanning, and asset RFID telemetry.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* RFID Attendance */}
                    <HardwareToggleCard
                        title="RFID Attendance"
                        settingKey="rfid_attendance"
                        setting={rfidAttendance}
                        icon={Radio}
                        accent="emerald"
                        description="Enables contactless RFID card scanning terminals for attendance time logs."
                        onToggle={onToggle}
                    />

                    {/* Face Recognition Attendance */}
                    <HardwareToggleCard
                        title="Face Attendance"
                        settingKey="face_attendance"
                        setting={faceAttendance}
                        icon={ScanFace}
                        accent="cyan"
                        description="Enables AI biometric facial recognition checkpoints for high-security time tracking."
                        onToggle={onToggle}
                    />

                    {/* RFID Asset Tagging */}
                    <HardwareToggleCard
                        title="RFID Asset Tagging"
                        settingKey="rfid_asset_tagging"
                        setting={rfidTagging}
                        icon={Tag}
                        accent="violet"
                        description="Enables RFID scanning workflows for inventory tracking and equipment audits."
                        onToggle={onToggle}
                    />
                </div>
            </div>

            {/* 3. Payroll Governance & Security Policies */}
            <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-1">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
                            Payroll Governance & Read-Only Policies
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Access lock controls preventing accidental modifications during sensitive payroll runs.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payroll Employee Read-Only */}
                    <GovernanceToggleCard
                        title="Payroll Employee Management Read-Only"
                        settingKey="payroll_employee_management_read_only"
                        setting={payrollEmpReadOnly}
                        icon={Lock}
                        description="Restricts employee record changes in Payroll. When enabled, user details are locked into read-only mode to prevent payroll discrepancies."
                        onToggle={onToggle}
                    />

                    {/* Payroll Department Read-Only */}
                    <GovernanceToggleCard
                        title="Payroll Department Management Read-Only"
                        settingKey="payroll_department_management_read_only"
                        setting={payrollDeptReadOnly}
                        icon={ShieldAlert}
                        description="Restricts department structure changes in Payroll. When enabled, cost centers and departments cannot be reconfigured."
                        onToggle={onToggle}
                    />
                </div>
            </div>

            {/* 4. Additional System Parameters (if any extra keys exist) */}
            {otherSettings.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2.5 px-1">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <FileCode2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
                                Custom / Additional Parameters
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Additional system keys registered in the general settings database.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {otherSettings.map((s) => (
                            <GlassCard key={s.id} accent="amber" className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {s.title}
                                        </h5>
                                        <code className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                                            {s.settingKey}
                                        </code>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => onOpenEditModal(s)}
                                        className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                                    >
                                        <Pencil className="w-3.5 h-3.5 text-slate-500" />
                                    </Button>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Value</span>
                                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                                        {s.settingValue}
                                    </span>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Subcomponent: Hardware Toggle Card
interface HardwareToggleCardProps {
    title: string;
    settingKey: string;
    setting?: GeneralSetting;
    icon: React.ComponentType<{ className?: string }>;
    accent: "emerald" | "cyan" | "violet";
    description: string;
    onToggle: (setting: GeneralSetting) => Promise<boolean>;
}

function HardwareToggleCard({
    title,
    settingKey,
    setting,
    icon: Icon,
    accent,
    description,
    onToggle,
}: HardwareToggleCardProps) {
    const isEnabled = setting ? setting.booleanValue : false;
    const [isPending, setIsPending] = React.useState(false);

    const handleToggle = async () => {
        if (!setting) return;
        setIsPending(true);
        await onToggle(setting);
        setIsPending(false);
    };

    return (
        <GlassCard accent={accent} className="p-6">
            <div className="flex flex-col h-full justify-between gap-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "p-3 rounded-2xl",
                                    accent === "emerald" && "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
                                    accent === "cyan" && "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400",
                                    accent === "violet" && "bg-violet-500/10 text-violet-500 dark:text-violet-400"
                                )}
                            >
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    {title}
                                </h4>
                                <code className="text-[11px] font-mono text-slate-400">
                                    {settingKey}
                                </code>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
                        {description}
                    </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isEnabled ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <XCircle className="w-4 h-4 text-slate-400" />
                        )}
                        <span
                            className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                isEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                            )}
                        >
                            {isEnabled ? "Enabled" : "Disabled"}
                        </span>
                    </div>

                    <Switch
                        checked={isEnabled}
                        disabled={isPending || !setting}
                        onCheckedChange={handleToggle}
                    />
                </div>
            </div>
        </GlassCard>
    );
}

// Subcomponent: Governance Toggle Card
interface GovernanceToggleCardProps {
    title: string;
    settingKey: string;
    setting?: GeneralSetting;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    onToggle: (setting: GeneralSetting) => Promise<boolean>;
}

function GovernanceToggleCard({
    title,
    settingKey,
    setting,
    icon: Icon,
    description,
    onToggle,
}: GovernanceToggleCardProps) {
    const isEnabled = setting ? setting.booleanValue : false;
    const [isPending, setIsPending] = React.useState(false);

    const handleToggle = async () => {
        if (!setting) return;
        setIsPending(true);
        await onToggle(setting);
        setIsPending(false);
    };

    return (
        <GlassCard accent="rose" className="p-6">
            <div className="flex flex-col h-full justify-between gap-5">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    {title}
                                </h4>
                                <code className="text-[11px] font-mono text-rose-600 dark:text-rose-400">
                                    {settingKey}
                                </code>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                isEnabled
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            )}
                        >
                            {isEnabled ? "Lock Active" : "Lock Inactive"}
                        </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
                        {description}
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Enforcement Status
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isEnabled
                                ? "MODIFICATIONS PREVENTED (READ-ONLY)"
                                : "WRITES & UPDATES PERMITTED"}
                        </p>
                    </div>

                    <Switch
                        checked={isEnabled}
                        disabled={isPending || !setting}
                        onCheckedChange={handleToggle}
                    />
                </div>
            </div>
        </GlassCard>
    );
}

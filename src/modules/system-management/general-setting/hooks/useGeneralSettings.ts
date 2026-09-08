"use client";

import * as React from "react";
import { GeneralSetting } from "../types/general-setting.types";
import { GeneralSettingRepo } from "../services/general-setting.repo";
import { toast } from "sonner";

export function useGeneralSettings() {
    const [settings, setSettings] = React.useState<GeneralSetting[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isInitializing, setIsInitializing] = React.useState(false);

    const fetchSettings = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await GeneralSettingRepo.getAll();
            setSettings(data);
        } catch (err) {
            console.error("[useGeneralSettings] Fetch error:", err);
            toast.error("Failed to load general settings");
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const toggleSetting = React.useCallback(
        async (setting: GeneralSetting): Promise<boolean> => {
            const currentBool = setting.booleanValue;
            const newBool = !currentBool;
            const newValue = newBool ? "1" : "0";

            // Optimistic update
            setSettings((prev) =>
                prev.map((s) =>
                    s.id === setting.id || s.settingKey === setting.settingKey
                        ? { ...s, booleanValue: newBool, settingValue: newValue }
                        : s
                )
            );

            try {
                const success = await GeneralSettingRepo.toggle(
                    setting.id,
                    setting.settingKey,
                    currentBool
                );

                if (success) {
                    toast.success(
                        `${setting.title}: ${newBool ? "Enabled" : "Disabled"}`
                    );
                    return true;
                } else {
                    // Rollback
                    setSettings((prev) =>
                        prev.map((s) =>
                            s.id === setting.id || s.settingKey === setting.settingKey
                                ? { ...s, booleanValue: currentBool, settingValue: currentBool ? "1" : "0" }
                                : s
                        )
                    );
                    toast.error(`Failed to update ${setting.title}`);
                    return false;
                }
            } catch (err) {
                console.error("[useGeneralSettings] Toggle error:", err);
                // Rollback
                setSettings((prev) =>
                    prev.map((s) =>
                        s.id === setting.id || s.settingKey === setting.settingKey
                            ? { ...s, booleanValue: currentBool, settingValue: currentBool ? "1" : "0" }
                            : s
                    )
                );
                toast.error(`Failed to update ${setting.title}`);
                return false;
            }
        },
        []
    );

    const updateSetting = React.useCallback(
        async (
            target: { id?: number; settingKey?: string },
            newValue: string
        ): Promise<boolean> => {
            setIsSaving(true);
            try {
                let success = false;
                if (target.id) {
                    success = await GeneralSettingRepo.updateValue(target.id, newValue);
                } else if (target.settingKey) {
                    success = await GeneralSettingRepo.upsertByKey(target.settingKey, newValue);
                }

                if (success) {
                    toast.success("Setting saved successfully");
                    await fetchSettings();
                    return true;
                } else {
                    toast.error("Failed to save setting");
                    return false;
                }
            } catch (err) {
                console.error("[useGeneralSettings] Update error:", err);
                toast.error("Failed to save setting");
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [fetchSettings]
    );

    const initializeDefaults = React.useCallback(async () => {
        setIsInitializing(true);
        try {
            const res = await GeneralSettingRepo.initializeDefaults();
            if (res.seeded > 0) {
                toast.success(`Successfully initialized ${res.seeded} default setting(s)`);
            } else {
                toast.info("All default settings are already present");
            }
            await fetchSettings();
        } catch (err) {
            console.error("[useGeneralSettings] Initialize error:", err);
            toast.error("Failed to initialize default settings");
        } finally {
            setIsInitializing(false);
        }
    }, [fetchSettings]);

    const getSettingByKey = React.useCallback(
        (key: string): GeneralSetting | undefined => {
            return settings.find((s) => s.settingKey === key);
        },
        [settings]
    );

    const localizationSettings = React.useMemo(
        () => settings.filter((s) => s.category === "localization"),
        [settings]
    );

    const attendanceHardwareSettings = React.useMemo(
        () => settings.filter((s) => s.category === "attendance_hardware"),
        [settings]
    );

    const payrollGovernanceSettings = React.useMemo(
        () => settings.filter((s) => s.category === "payroll_governance"),
        [settings]
    );

    const customSettings = React.useMemo(
        () => settings.filter((s) => s.category === "system"),
        [settings]
    );

    return {
        settings,
        isLoading,
        isSaving,
        isInitializing,
        refresh: fetchSettings,
        toggleSetting,
        updateSetting,
        initializeDefaults,
        getSettingByKey,
        localizationSettings,
        attendanceHardwareSettings,
        payrollGovernanceSettings,
        customSettings,
    };
}

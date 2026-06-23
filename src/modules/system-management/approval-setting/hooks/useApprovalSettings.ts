"use client"

import * as React from "react"
import { ApprovalSetting } from "../types/approval-setting.types"
import { ApprovalSettingRepo } from "../services/approval-setting.repo"
import { toast } from "sonner"

export function useApprovalSettings() {
    const [settings, setSettings] = React.useState<ApprovalSetting[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    const fetchSettings = React.useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await ApprovalSettingRepo.getAll()
            setSettings(data)
        } catch (_err) {
            setError("Failed to load approval settings")
            toast.error("Failed to load approval settings")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    const toggleApproval = React.useCallback(async (id: number, currentValue: boolean): Promise<boolean> => {
        const newValue = currentValue ? 0 : 1
        const success = await ApprovalSettingRepo.toggle(id, newValue)
        if (success) {
            toast.success(`Approval ${newValue === 1 ? "enabled" : "disabled"}`)
            setSettings(prev =>
                prev.map(s => s.id === id ? { ...s, isApproval: !currentValue } : s)
            )
            return true
        }
        toast.error("Failed to toggle approval setting")
        return false
    }, [])

    return {
        settings,
        isLoading,
        error,
        refresh: fetchSettings,
        toggleApproval,
    }
}

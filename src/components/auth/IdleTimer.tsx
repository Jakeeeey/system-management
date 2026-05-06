"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const IDLE_TIMEOUT = 15 * 60 * 1000 // 15 minutes
const WARNING_TIMEOUT = 14 * 60 * 1000 // Show warning at 14 minutes

export function IdleTimer() {
    const router = useRouter()
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const warningRef = React.useRef<NodeJS.Timeout | null>(null)

    const logout = React.useCallback(async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" })
            if (res.ok) {
                toast.info("Session Expired", {
                    description: "You have been logged out due to inactivity.",
                })
                router.push("/login")
                router.refresh()
            }
        } catch (error) {
            console.error("[IdleTimer] Logout failed:", error)
        }
    }, [router])

    const resetTimer = React.useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (warningRef.current) clearTimeout(warningRef.current)

        // Set warning timer
        warningRef.current = setTimeout(() => {
            toast.warning("Inactivity Warning", {
                description: "Your session will expire in 1 minute due to inactivity.",
                duration: 10000,
            })
        }, WARNING_TIMEOUT)

        // Set logout timer
        timeoutRef.current = setTimeout(logout, IDLE_TIMEOUT)
    }, [logout])

    React.useEffect(() => {
        const events = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
            "click"
        ]

        const handleActivity = () => resetTimer()

        // Initialize timer
        resetTimer()

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, handleActivity)
        })

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (warningRef.current) clearTimeout(warningRef.current)
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity)
            })
        }
    }, [resetTimer])

    return null // This component doesn't render anything
}

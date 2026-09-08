"use client";

import { useEffect, useRef } from "react";
import { checkNewTicketUpdates } from "@/actions/notification.action";

export function NotificationProvider() {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Request permission on mount
        if ("Notification" in window && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        const pollNotifications = async () => {
            if (!("Notification" in window) || Notification.permission !== "granted") {
                return;
            }

            const STORAGE_KEY = "vos_last_notification_check";
            let lastChecked = localStorage.getItem(STORAGE_KEY);
            
            // If it's the first time running, just set the timestamp to now so we don't get a flood of old notifications
            if (!lastChecked) {
                lastChecked = new Date().toISOString();
                localStorage.setItem(STORAGE_KEY, lastChecked);
                return;
            }

            try {
                const newUpdates = await checkNewTicketUpdates(lastChecked);
                
                if (newUpdates && newUpdates.length > 0) {
                    // Update the timestamp to the latest notification's timestamp or now
                    const latestTime = newUpdates.reduce((latest, current) => {
                        return new Date(current.timestamp) > new Date(latest) ? current.timestamp : latest;
                    }, lastChecked);
                    
                    // Add a tiny buffer (1 millisecond) so we don't fetch the exact same one again
                    const nextCheckTime = new Date(new Date(latestTime).getTime() + 1000).toISOString();
                    localStorage.setItem(STORAGE_KEY, nextCheckTime);

                    // Trigger Native Notifications
                    newUpdates.forEach(update => {
                        const notification = new Notification(update.title, {
                            body: update.body,
                            icon: "/favicon.ico", // Or appropriate icon path
                            tag: update.id, // Prevents duplicate notifications with the same ID
                        });

                        // Clicking the notification can focus the window or navigate to the ticket
                        notification.onclick = () => {
                            window.focus();
                            // Optional: navigate to ticket
                            // window.location.href = `/system-management/my-ticket/${update.ticketId}`;
                        };
                    });
                } else {
                    // If no updates, just move the timestamp forward to now to keep checking fresh
                    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        };

        // Check immediately (after 2 seconds) and then every 30 seconds
        const timeout = setTimeout(() => {
            pollNotifications();
            intervalRef.current = setInterval(pollNotifications, 30000);
        }, 2000);

        return () => {
            clearTimeout(timeout);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // This component renders nothing, it just runs in the background
    return null;
}

"use server";

import { cookies } from "next/headers";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.DIRECTUS_API_URL || "";
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

export type NotificationPayload = {
    id: string;
    title: string;
    body: string;
    ticketId: string | number;
    timestamp: string;
};

export async function checkNewTicketUpdates(lastCheckedIso: string): Promise<NotificationPayload[]> {
    try {
        let currentUserId: number | null = null;
        try {
            const cookieStore = await cookies();
            const token = cookieStore.get("vos_access_token")?.value;
            if (token) {
                const parts = token.split(".");
                if (parts.length >= 2) {
                    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
                    const json = Buffer.from(padded, "base64").toString("utf8");
                    const payload = JSON.parse(json);
                    currentUserId = Number(payload.id || payload.user_id || payload.sub) || null;
                }
            }
        } catch (e) {
            console.warn("Could not extract user_id from cookie:", e);
        }

        if (!currentUserId) return [];

        const notifications: NotificationPayload[] = [];

        // 1. Check for newly assigned tickets (updated_at > lastCheckedIso)
        // Note: Directus handles date filtering. We need url encoding for brackets.
        const ticketsRes = await fetch(
            `${DIRECTUS_URL}/items/ticket?filter[assigned_to][_eq]=${currentUserId}&filter[updated_at][_gt]=${lastCheckedIso}&access_token=${STATIC_TOKEN}`,
            { cache: 'no-store' }
        );

        if (ticketsRes.ok) {
            const ticketsResult = await ticketsRes.json();
            const tickets = ticketsResult.data || [];
            
            for (const t of tickets) {
                // If it was just created or updated to assign to me
                // Ideally we check if the assignee actually changed, but checking updated_at is a good proxy for this simple polling
                notifications.push({
                    id: `tkt-${t.ticket_id}-${t.updated_at}`,
                    title: `Ticket Assigned: ${t.ticket_number || 'Ticket'}`,
                    body: t.title || "A ticket has been updated or assigned to you.",
                    ticketId: t.ticket_id,
                    timestamp: t.updated_at
                });
            }
        }

        // 2. Check for follow up activities on tickets assigned to current user
        // We find activities where activity_type = 'Follow-Up' and created_at > lastCheckedIso
        const activityRes = await fetch(
            `${DIRECTUS_URL}/items/ticket_activity?filter[activity_type][_eq]=Follow-Up&filter[created_at][_gt]=${lastCheckedIso}&access_token=${STATIC_TOKEN}&fields=*,ticket_id.*`,
            { cache: 'no-store' }
        );

        if (activityRes.ok) {
            const activityResult = await activityRes.json();
            const activities = activityResult.data || [];
            
            for (const a of activities) {
                // Check if the ticket belongs to the current user (if Directus expanded ticket_id)
                const isMyTicket = a.ticket_id && typeof a.ticket_id === 'object' 
                    ? (a.ticket_id.assigned_to === currentUserId || a.ticket_id.assigned_to?.user_id === currentUserId)
                    : false; // If not expanded or not ours, we skip, unless we do another fetch

                // If Directus didn't expand or we can't be sure, we might just assume it is ours if we want to be noisy, 
                // but let's do a quick check if not expanded:
                let belongsToMe = isMyTicket;
                if (!belongsToMe && typeof a.ticket_id === 'number') {
                    // Quick check ticket owner
                    const tRes = await fetch(`${DIRECTUS_URL}/items/ticket/${a.ticket_id}?access_token=${STATIC_TOKEN}&fields=assigned_to`, { cache: 'no-store' });
                    if (tRes.ok) {
                        const tData = await tRes.json();
                        belongsToMe = (tData.data?.assigned_to === currentUserId);
                    }
                }

                if (belongsToMe) {
                    notifications.push({
                        id: `act-${a.activity_id}-${a.created_at}`,
                        title: `Ticket Follow-Up`,
                        body: a.note || "A follow-up was requested for your ticket.",
                        ticketId: typeof a.ticket_id === 'object' ? a.ticket_id.ticket_id : a.ticket_id,
                        timestamp: a.created_at
                    });
                }
            }
        }

        return notifications;
    } catch (error) {
        console.error("Failed to check new ticket updates:", error);
        return [];
    }
}

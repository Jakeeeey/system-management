"use server"

import { Ticket, TicketCategory, TicketActivity } from "../modules/system-management/ticket/types/ticket.types";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.DIRECTUS_API_URL || "";
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

import { cookies } from "next/headers";

function _getUserIdFromCookie(): number | null {
    try {
        // We need to use async cookies API in Next.js 15, but since this is a helper we'll await it inside the action
        return null;
    } catch {
        return null;
    }
}

export async function fetchTickets(): Promise<Ticket[]> {
    try {
        const [response, categories] = await Promise.all([
            fetch(`${DIRECTUS_URL}/items/ticket?access_token=${STATIC_TOKEN}&limit=-1&fields=*.*`, {
                cache: 'no-store'
            }),
            fetchTicketCategories()
        ]);
        
        if (!response.ok) return [];
        
        const result = await response.json();
        const data = result.data || [];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((item: any) => {
            let catObj = item.category_id && typeof item.category_id === 'object' ? {
                categoryId: item.category_id.category_id,
                categoryName: item.category_id.category_name,
                description: item.category_id.description,
                isActive: item.category_id.is_active
            } : undefined;

            // If Directus didn't expand the relation, manually map it from fetched categories
            if (!catObj && item.category_id !== undefined && item.category_id !== null) {
                const catIdToFind = Number(item.category_id);
                const foundCat = categories.find(c => c.categoryId === catIdToFind);
                if (foundCat) {
                    catObj = foundCat;
                }
            }

            return {
                ticketId: item.ticket_id,
                ticketNumber: item.ticket_number,
                title: item.title,
                description: item.description,
                categoryId: typeof item.category_id === 'object' && item.category_id ? item.category_id.category_id : item.category_id,
                status: item.status,
                priority: item.priority,
                createdBy: typeof item.created_by === 'object' && item.created_by ? item.created_by.user_id : item.created_by,
                assignedTo: typeof item.assigned_to === 'object' && item.assigned_to ? item.assigned_to.user_id : item.assigned_to,
                assigneeName: typeof item.assigned_to === 'object' && item.assigned_to ? 
                    `${item.assigned_to.user_fname || ''} ${item.assigned_to.user_lname || ''}`.trim() || item.assigned_to.user_email : undefined,
                reporterName: item.reporter_name,
                reporterDescription: item.reporter_description,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
                images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images || [],
                followUpTimestamp: item.follow_up_timestamp || null,
                category: catObj
            };
        });
    } catch (_error) {
        console.warn("Failed to fetch tickets (transient connection issue). Retrying on next render.");
        return [];
    }
}

export async function fetchTicketById(id: number | string): Promise<Ticket | null> {
    try {
        const [response, categories] = await Promise.all([
            fetch(`${DIRECTUS_URL}/items/ticket/${id}?access_token=${STATIC_TOKEN}&fields=*.*`, {
                cache: 'no-store'
            }),
            fetchTicketCategories()
        ]);
        
        if (!response.ok) return null;
        
        const result = await response.json();
        const item = result.data;
        if (!item) return null;

        let catObj = item.category_id && typeof item.category_id === 'object' ? {
            categoryId: item.category_id.category_id,
            categoryName: item.category_id.category_name,
            description: item.category_id.description,
            isActive: item.category_id.is_active
        } : undefined;

        // If Directus didn't expand the relation, manually map it from fetched categories
        if (!catObj && item.category_id !== undefined && item.category_id !== null) {
            const catIdToFind = Number(item.category_id);
            const foundCat = categories.find(c => c.categoryId === catIdToFind);
            if (foundCat) {
                catObj = foundCat;
            }
        }

        return {
            ticketId: item.ticket_id,
            ticketNumber: item.ticket_number,
            title: item.title,
            description: item.description,
            categoryId: item.category_id?.category_id || item.category_id,
            status: item.status,
            priority: item.priority,
            createdBy: typeof item.created_by === 'object' && item.created_by ? item.created_by.user_id : item.created_by,
            assignedTo: typeof item.assigned_to === 'object' && item.assigned_to ? item.assigned_to.user_id : item.assigned_to,
            assigneeName: typeof item.assigned_to === 'object' && item.assigned_to ? 
                `${item.assigned_to.user_fname || ''} ${item.assigned_to.user_lname || ''}`.trim() || item.assigned_to.user_email : undefined,
            reporterName: item.reporter_name,
            reporterDescription: item.reporter_description,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images || [],
            followUpTimestamp: item.follow_up_timestamp || null,
            category: catObj
        };
    } catch (error) {
        console.warn("Failed to fetch ticket by ID:", error);
        return null;
    }
}

export async function fetchTicketActivities(ticketId: number | string): Promise<TicketActivity[]> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/ticket_activity?filter[ticket_id][_eq]=${ticketId}&access_token=${STATIC_TOKEN}&sort=-created_at`, {
            cache: 'no-store'
        });
        if (!response.ok) return [];
        
        const result = await response.json();
        const data = result.data || [];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((a: any) => ({
            activityId: a.activity_id,
            ticketId: a.ticket_id,
            userId: a.user_id,
            activityType: a.activity_type,
            oldStatus: a.old_status,
            newStatus: a.new_status,
            note: a.note,
            createdAt: a.created_at,
        }));
    } catch (error) {
        console.warn("Failed to fetch ticket activities:", error);
        return [];
    }
}

export async function fetchTicketCategories(): Promise<TicketCategory[]> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/ticket_category?access_token=${STATIC_TOKEN}&limit=-1`, {
            cache: 'no-store'
        });
        if (!response.ok) return [];
        
        const result = await response.json();
        const data = result.data || [];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((item: any) => ({
            categoryId: item.category_id,
            categoryName: item.category_name,
            description: item.description,
            isActive: item.is_active,
        }));
    } catch (_error) {
        console.warn("Failed to fetch ticket categories (transient connection issue). Retrying on next render.");
        return [];
    }
}

export async function uploadTicketImages(formData: FormData): Promise<string[]> {
    try {
        const files = formData.getAll('files');
        if (!files || files.length === 0) return [];

        const uploadPromises = files.map(async (file) => {
            const singleFormData = new FormData();
            singleFormData.append('file', file);
            
            const response = await fetch(`${DIRECTUS_URL}/files?access_token=${STATIC_TOKEN}`, {
                method: 'POST',
                body: singleFormData
            });
            
            if (!response.ok) {
                console.error("Failed to upload file:", await response.text());
                return null;
            }
            const result = await response.json();
            return result.data?.id; // Returns Directus file ID
        });

        const uploadedIds = await Promise.all(uploadPromises);
        return uploadedIds.filter(Boolean) as string[];
    } catch (error) {
        console.error("Failed to upload ticket images:", error);
        return [];
    }
}

export async function addTicket(data: Partial<Ticket>): Promise<boolean> {
    try {
        let newTicketNumber = data.ticketNumber;
        if (!newTicketNumber) {
            // Fetch the last ticket to generate an incremental ticket number
            try {
                const lastTicketRes = await fetch(`${DIRECTUS_URL}/items/ticket?access_token=${STATIC_TOKEN}&sort=-ticket_id&limit=1&fields=ticket_number`, {
                    cache: 'no-store'
                });
                if (lastTicketRes.ok) {
                    const lastTicketData = await lastTicketRes.json();
                    if (lastTicketData.data && lastTicketData.data.length > 0 && lastTicketData.data[0].ticket_number) {
                        const lastNumber = lastTicketData.data[0].ticket_number;
                        const match = lastNumber.match(/TKT-(\d+)/);
                        if (match && match[1]) {
                            const nextNum = parseInt(match[1], 10) + 1;
                            newTicketNumber = `TKT-${nextNum.toString().padStart(6, '0')}`;
                        }
                    }
                }
            } catch (e) {
                console.warn("Could not fetch last ticket for incrementing.", e);
            }
            if (!newTicketNumber) {
                newTicketNumber = "TKT-000001";
            }
        }

        const response = await fetch(`${DIRECTUS_URL}/items/ticket?access_token=${STATIC_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ticket_number: newTicketNumber,
                title: data.title,
                description: data.description,
                category_id: data.categoryId,
                status: data.status || 'Open',
                priority: data.priority || 'Medium',
                created_by: data.createdBy,
                assigned_to: data.assignedTo,
                reporter_name: data.reporterName,
                reporter_description: data.reporterDescription,
                images: data.images ? JSON.stringify(data.images) : null,
                created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to create ticket in Directus. Status:", response.status, "Response:", errorText);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Failed to create ticket:", error);
        return false;
    }
}

export async function editTicket(id: number, data: Partial<Ticket>): Promise<boolean> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/ticket/${id}?access_token=${STATIC_TOKEN}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: data.title,
                description: data.description,
                category_id: data.categoryId,
                status: data.status,
                priority: data.priority,
                assigned_to: data.assignedTo,
                reporter_name: data.reporterName,
                reporter_description: data.reporterDescription,
                updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            })
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to update ticket:", error);
        return false;
    }
}

export async function updateTicketWithActivity(
    id: number, 
    data: { status?: string; assignedTo?: number | null; note?: string },
    oldStatus: string
): Promise<boolean> {
    try {
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // 1. Update ticket fields
        const updatePayload: Record<string, unknown> = {
            updated_at: timestamp
        };
        if (data.status) updatePayload.status = data.status;
        if (data.assignedTo !== undefined) updatePayload.assigned_to = data.assignedTo;

        const response = await fetch(`${DIRECTUS_URL}/items/ticket/${id}?access_token=${STATIC_TOKEN}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });

        if (!response.ok) {
            console.error("Failed to patch ticket:", await response.text());
            return false;
        }

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

        // 2. Log activity
        const activityPayload = {
            ticket_id: id,
            user_id: currentUserId || 24, // Fallback to 24 if we can't determine it
            activity_type: 'Ticket Update',
            old_status: oldStatus,
            new_status: data.status || oldStatus,
            note: data.note || null,
            created_at: timestamp
        };

        const activityRes = await fetch(`${DIRECTUS_URL}/items/ticket_activity?access_token=${STATIC_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityPayload)
        });

        if (!activityRes.ok) {
            console.error("Failed to log activity:", await activityRes.text());
        }

        return true;
    } catch (error) {
        console.error("Failed to update ticket and activity:", error);
        return false;
    }
}

export async function removeTicket(id: number): Promise<boolean> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/ticket/${id}?access_token=${STATIC_TOKEN}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to delete ticket:", error);
        return false;
    }
}

export async function triggerTicketFollowUp(id: number): Promise<boolean> {
    try {
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const response = await fetch(`${DIRECTUS_URL}/items/ticket/${id}?access_token=${STATIC_TOKEN}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                follow_up_timestamp: timestamp
            })
        });

        if (response.ok) {
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
            } catch (_e) { }

            // Log the follow-up in the ticket's activity timeline
            const activityRes = await fetch(`${DIRECTUS_URL}/items/ticket_activity?access_token=${STATIC_TOKEN}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticket_id: id,
                    user_id: currentUserId || 24,
                    activity_type: 'Follow-Up',
                    note: 'A follow-up was requested for this ticket.',
                    created_at: timestamp
                })
            });
            if (!activityRes.ok) {
                const errText = await activityRes.text();
                console.error("Failed to insert into ticket_activity:", errText);
            }
        }

        return response.ok;
    } catch (error) {
        console.error("Failed to trigger follow-up:", error);
        return false;
    }
}

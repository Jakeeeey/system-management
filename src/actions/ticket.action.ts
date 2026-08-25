"use server"

import { Ticket, TicketCategory, TicketActivity } from "../modules/system-management/ticket/types/ticket.types";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.DIRECTUS_API_URL || "";
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

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
                category: catObj
            };
        });
    } catch (error) {
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
    } catch (error) {
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

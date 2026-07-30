"use server"

const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.DIRECTUS_API_URL || "";
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

export interface SubscriptionLite {
    id: number;
    name: string;
}

export async function fetchSubscriptions(): Promise<SubscriptionLite[]> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/subscription?access_token=${STATIC_TOKEN}&limit=-1`, {
            cache: 'no-store'
        });
        if (!response.ok) return [];
        
        const result = await response.json();
        const data = result.data || [];
        
        return data.map((item: any) => ({
            id: item.id,
            name: item.name
        }));
    } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
        return [];
    }
}

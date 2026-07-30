"use server"

import { CompanyType } from "../modules/file-management/company-type/types/company-type.types";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.DIRECTUS_API_URL || "";
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

export async function fetchCompanyTypes(): Promise<CompanyType[]> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/company_type?access_token=${STATIC_TOKEN}&limit=-1`, {
            cache: 'no-store'
        });
        if (!response.ok) return [];
        
        const result = await response.json();
        const data = result.data || [];
        
        return data.map((item: any) => ({
            companyTypeId: item.company_type_id,
            companyTypeName: item.company_type_name,
            description: item.description,
            createdDate: item.created_date,
            status: item.status
        }));
    } catch (error) {
        console.error("Failed to fetch company types:", error);
        return [];
    }
}

export async function addCompanyType(data: Partial<CompanyType>): Promise<boolean> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/company_type?access_token=${STATIC_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                company_type_name: data.companyTypeName,
                description: data.description,
                status: data.status,
                created_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
            })
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to create company type:", error);
        return false;
    }
}

export async function editCompanyType(id: number, data: Partial<CompanyType>): Promise<boolean> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/company_type/${id}?access_token=${STATIC_TOKEN}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                company_type_name: data.companyTypeName,
                description: data.description,
                status: data.status
            })
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to update company type:", error);
        return false;
    }
}

export async function removeCompanyType(id: number): Promise<boolean> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/company_type/${id}?access_token=${STATIC_TOKEN}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to delete company type:", error);
        return false;
    }
}

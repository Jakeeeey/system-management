"use server"

import { CompanyList } from "../modules/file-management/company-list/types/company-list.types";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.DIRECTUS_API_URL || "";
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

export async function fetchCompanyList(): Promise<CompanyList[]> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/company_list?access_token=${STATIC_TOKEN}&limit=-1`, {
            cache: 'no-store'
        });
        if (!response.ok) return [];
        
        const result = await response.json();
        const data = result.data || [];
        
        return data.map((item: any) => ({
            companyId: item.company_id,
            companyName: item.company_name,
            companyTypeId: item.company_type_id,
            companyCode: item.company_code,
            companyAddress: item.company_address,
            companyBrgy: item.company_brgy,
            companyCity: item.company_city,
            companyProvince: item.company_province,
            companyZipCode: item.company_zip_code,
            companyRegistrationNumber: item.company_registration_number,
            companyTin: item.company_tin,
            companyDateAdmitted: item.company_date_admitted,
            companyContact: item.company_contact,
            companyEmail: item.company_email,
            companyOutlook: item.company_outlook,
            companyGmail: item.company_gmail,
            companyDepartment: item.company_department,
            companyLogo: item.company_logo,
            companyFacebook: item.company_facebook,
            companyWebsite: item.company_website,
            companyTags: item.company_tags,
            directus: item.directus,
            springboot: item.springboot,
            subscriptionId: item.subscription_id,
            createdDate: item.created_date,
            createdBy: item.created_by,
            status: item.status,
            directusToken: item.directus_token,
            springbootToken: item.springboot_token
        }));
    } catch (error) {
        console.error("Failed to fetch company list:", error);
        return [];
    }
}

export async function addCompanyList(data: Partial<CompanyList>): Promise<boolean> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/company_list?access_token=${STATIC_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                company_name: data.companyName,
                company_type_id: data.companyTypeId,
                company_code: data.companyCode,
                company_address: data.companyAddress,
                company_brgy: data.companyBrgy,
                company_city: data.companyCity,
                company_province: data.companyProvince,
                company_zip_code: data.companyZipCode,
                company_registration_number: data.companyRegistrationNumber,
                company_tin: data.companyTin,
                company_date_admitted: data.companyDateAdmitted,
                company_contact: data.companyContact,
                company_email: data.companyEmail,
                company_outlook: data.companyOutlook,
                company_gmail: data.companyGmail,
                company_department: data.companyDepartment,
                company_logo: data.companyLogo,
                company_facebook: data.companyFacebook,
                company_website: data.companyWebsite,
                company_tags: data.companyTags,
                directus: data.directus,
                springboot: data.springboot,
                subscription_id: data.subscriptionId,
                directus_token: data.directusToken,
                springboot_token: data.springbootToken,
                status: data.status,
                created_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
            })
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to create company list:", error);
        return false;
    }
}

export async function editCompanyList(id: number, data: Partial<CompanyList>): Promise<boolean> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/company_list/${id}?access_token=${STATIC_TOKEN}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                company_name: data.companyName,
                company_type_id: data.companyTypeId,
                company_code: data.companyCode,
                company_address: data.companyAddress,
                company_brgy: data.companyBrgy,
                company_city: data.companyCity,
                company_province: data.companyProvince,
                company_zip_code: data.companyZipCode,
                company_registration_number: data.companyRegistrationNumber,
                company_tin: data.companyTin,
                company_date_admitted: data.companyDateAdmitted,
                company_contact: data.companyContact,
                company_email: data.companyEmail,
                company_outlook: data.companyOutlook,
                company_gmail: data.companyGmail,
                company_department: data.companyDepartment,
                company_logo: data.companyLogo,
                company_facebook: data.companyFacebook,
                company_website: data.companyWebsite,
                company_tags: data.companyTags,
                directus: data.directus,
                springboot: data.springboot,
                subscription_id: data.subscriptionId,
                directus_token: data.directusToken,
                springboot_token: data.springbootToken,
                status: data.status
            })
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to update company list:", error);
        return false;
    }
}

export async function removeCompanyList(id: number): Promise<boolean> {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/company_list/${id}?access_token=${STATIC_TOKEN}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to delete company list:", error);
        return false;
    }
}

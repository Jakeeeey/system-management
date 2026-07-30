export interface CompanyList {
    companyId: number;
    companyName: string | null;
    companyTypeId: number | null;
    companyCode: string;
    companyAddress: string | null;
    companyBrgy: string | null;
    companyCity: string | null;
    companyProvince: string | null;
    companyZipCode: string | null;
    companyRegistrationNumber: string | null;
    companyTin: string | null;
    companyDateAdmitted: string | null; // Date string format YYYY-MM-DD
    companyContact: string | null;
    companyEmail: string | null;
    companyOutlook: string | null;
    companyGmail: string | null;
    companyDepartment: string | null;
    companyLogo: string | null;
    companyFacebook: string | null;
    companyWebsite: string | null;
    companyTags: string | null;
    directus: string | null;
    springboot: string | null;
    subscriptionId: number | null;
    createdDate: string | null; // Timestamp
    createdBy: string | null;
    status: string | null;
    directusToken: string | null;
    springbootToken: string | null;
}

export type CompanyListAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';

export interface CompanyType {
    companyTypeId: number;
    companyTypeName: string;
    description: string | null;
    createdDate: string | null;
    status: string | null;
}

export type CompanyTypeAction = 'CREATE' | 'UPDATE' | 'DELETE';

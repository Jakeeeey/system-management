import { CompanyType } from "../types/company-type.types";
import { fetchCompanyTypes, addCompanyType, editCompanyType, removeCompanyType } from "../../../../actions/company-type.action";

export class CompanyTypeService {
    static async getCompanyTypes(): Promise<CompanyType[]> {
        return await fetchCompanyTypes();
    }

    static async createCompanyType(data: Partial<CompanyType>): Promise<boolean> {
        return await addCompanyType(data);
    }

    static async updateCompanyType(id: number, data: Partial<CompanyType>): Promise<boolean> {
        return await editCompanyType(id, data);
    }

    static async deleteCompanyType(id: number): Promise<boolean> {
        return await removeCompanyType(id);
    }
}

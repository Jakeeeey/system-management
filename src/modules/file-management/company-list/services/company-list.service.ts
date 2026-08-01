import { CompanyList } from "../types/company-list.types";
import { fetchCompanyList, addCompanyList, editCompanyList, removeCompanyList } from "../../../../actions/company-list.action";

export class CompanyListService {
    static async getCompanyList(): Promise<CompanyList[]> {
        return await fetchCompanyList();
    }

    static async createCompany(data: Partial<CompanyList>): Promise<boolean> {
        return await addCompanyList(data);
    }

    static async updateCompany(id: number, data: Partial<CompanyList>): Promise<boolean> {
        return await editCompanyList(id, data);
    }

    static async deleteCompany(id: number): Promise<boolean> {
        return await removeCompanyList(id);
    }
}

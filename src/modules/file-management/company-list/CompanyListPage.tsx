"use client";

import * as React from "react";
import { GlassCard } from "@/components/command-center/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { CompanyList } from "./types/company-list.types";
import { CompanyListService } from "./services/company-list.service";
import { CompanyListModal } from "./components/CompanyListModal";
import { CompanyListInput } from "./types/company-list.schema";

export default function CompanyListPage() {
    const [companies, setCompanies] = React.useState<CompanyList[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedCompany, setSelectedCompany] = React.useState<CompanyList | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await CompanyListService.getCompanyList();
            setCompanies(data);
        } catch (error) {
            console.error("Failed to load companies", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const filteredData = React.useMemo(() => {
        return companies.filter(c => 
            (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            c.companyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.companyEmail && c.companyEmail.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [companies, searchQuery]);

    const handleOpenModal = (c?: CompanyList) => {
        setSelectedCompany(c || null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: CompanyListInput) => {
        let success = false;
        if (selectedCompany) {
            success = await CompanyListService.updateCompany(selectedCompany.companyId, data);
        } else {
            success = await CompanyListService.createCompany(data);
        }
        
        if (success) {
            await loadData();
        }
        return success;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
                        <Building className="w-8 h-8 text-primary" />
                        Company List
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Manage registered companies and their details.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        className="h-11 px-5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md"
                        onClick={() => handleOpenModal()}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Register Company
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10"
                        />
                    </div>
                </div>

                <div className="relative overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-black tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Company Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Loading companies...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No companies found.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((c) => (
                                    <tr key={c.companyId} className="bg-white/50 dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                            {c.companyCode}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {c.companyName || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {c.companyEmail || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {[c.companyCity, c.companyProvince].filter(Boolean).join(", ") || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                                                c.status === 'ACTIVE' 
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                                            }`}>
                                                {c.status || "UNKNOWN"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-slate-400 hover:text-primary"
                                                    onClick={() => handleOpenModal(c)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-slate-400 hover:text-rose-500"
                                                    onClick={async () => {
                                                        if (confirm("Are you sure you want to delete this company?")) {
                                                            const success = await CompanyListService.deleteCompany(c.companyId);
                                                            if (success) loadData();
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <CompanyListModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                company={selectedCompany}
                onSave={handleSave}
            />
        </div>
    );
}

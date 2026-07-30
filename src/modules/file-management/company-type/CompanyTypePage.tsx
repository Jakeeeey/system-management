"use client";

import * as React from "react";
import { GlassCard } from "@/components/command-center/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { CompanyType } from "./types/company-type.types";
import { CompanyTypeService } from "./services/company-type.service";
import { CompanyTypeModal } from "./components/CompanyTypeModal";
import { CompanyTypeInput } from "./types/company-type.schema";

export default function CompanyTypePage() {
    const [companyTypes, setCompanyTypes] = React.useState<CompanyType[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedCompanyType, setSelectedCompanyType] = React.useState<CompanyType | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await CompanyTypeService.getCompanyTypes();
            setCompanyTypes(data);
        } catch (error) {
            console.error("Failed to load company types", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const filteredData = React.useMemo(() => {
        return companyTypes.filter(ct => 
            ct.companyTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ct.description && ct.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [companyTypes, searchQuery]);

    const handleOpenModal = (ct?: CompanyType) => {
        setSelectedCompanyType(ct || null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: CompanyTypeInput) => {
        let success = false;
        if (selectedCompanyType) {
            success = await CompanyTypeService.updateCompanyType(selectedCompanyType.companyTypeId, data);
        } else {
            success = await CompanyTypeService.createCompanyType(data);
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
                        <Building2 className="w-8 h-8 text-primary" />
                        Company Type
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Manage company types for the system.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        className="h-11 px-5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md"
                        onClick={() => handleOpenModal()}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Company Type
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search company types..."
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
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Company Type Name</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Loading company types...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No company types found.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((ct) => (
                                    <tr key={ct.companyTypeId} className="bg-white/50 dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            #{ct.companyTypeId}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {ct.companyTypeName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {ct.description || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                                                ct.status === 'ACTIVE' 
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                                            }`}>
                                                {ct.status || "UNKNOWN"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-slate-400 hover:text-primary"
                                                    onClick={() => handleOpenModal(ct)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-slate-400 hover:text-rose-500"
                                                    onClick={async () => {
                                                        if (confirm("Are you sure you want to delete this company type?")) {
                                                            const success = await CompanyTypeService.deleteCompanyType(ct.companyTypeId);
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

            <CompanyTypeModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                companyType={selectedCompanyType}
                onSave={handleSave}
            />
        </div>
    );
}

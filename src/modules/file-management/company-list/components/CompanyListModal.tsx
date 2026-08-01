"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CompanyListSchema, CompanyListInput } from "../types/company-list.schema"
import { CompanyList } from "../types/company-list.types"
import { Building } from "lucide-react"
import { CompanyType } from "../../company-type/types/company-type.types"
import { CompanyTypeService } from "../../company-type/services/company-type.service"
import { Controller } from "react-hook-form"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { fetchSubscriptions, SubscriptionLite } from "../../../../actions/subscription.action"

interface CompanyListModalProps {
    isOpen: boolean;
    onClose: () => void;
    company?: CompanyList | null;
    onSave: (data: CompanyListInput) => Promise<boolean>;
}

export function CompanyListModal({ isOpen, onClose, company, onSave }: CompanyListModalProps) {
    const isEdit = !!company;
    const [companyTypes, setCompanyTypes] = React.useState<CompanyType[]>([]);
    const [subscriptions, setSubscriptions] = React.useState<SubscriptionLite[]>([]);
    
    const { register, control, handleSubmit, formState: { errors }, reset } = useForm<CompanyListInput>({
        resolver: zodResolver(CompanyListSchema),
        defaultValues: {
            companyName: "",
            companyCode: "",
            companyTypeId: 1,
            companyAddress: "",
            companyBrgy: "",
            companyCity: "",
            companyProvince: "",
            companyZipCode: "",
            companyRegistrationNumber: "",
            companyTin: "",
            companyDateAdmitted: "",
            companyContact: "",
            companyEmail: "",
            companyOutlook: "",
            companyGmail: "",
            companyDepartment: "",
            companyFacebook: "",
            companyWebsite: "",
            companyTags: "",
            directus: "",
            springboot: "",
            subscriptionId: 0,
            directusToken: "",
            springbootToken: "",
            status: "ACTIVE"
        }
    });

    React.useEffect(() => {
        if (isOpen) {
            CompanyTypeService.getCompanyTypes().then(setCompanyTypes).catch(console.error);
            fetchSubscriptions().then(setSubscriptions).catch(console.error);
            if (company) {
                reset({
                    companyName: company.companyName || "",
                    companyCode: company.companyCode || "",
                    companyTypeId: company.companyTypeId || 1,
                    companyAddress: company.companyAddress || "",
                    companyBrgy: company.companyBrgy || "",
                    companyCity: company.companyCity || "",
                    companyProvince: company.companyProvince || "",
                    companyZipCode: company.companyZipCode || "",
                    companyRegistrationNumber: company.companyRegistrationNumber || "",
                    companyTin: company.companyTin || "",
                    companyDateAdmitted: company.companyDateAdmitted || "",
                    companyContact: company.companyContact || "",
                    companyEmail: company.companyEmail || "",
                    companyOutlook: company.companyOutlook || "",
                    companyGmail: company.companyGmail || "",
                    companyDepartment: company.companyDepartment || "",
                    companyFacebook: company.companyFacebook || "",
                    companyWebsite: company.companyWebsite || "",
                    companyTags: company.companyTags || "",
                    directus: company.directus || "",
                    springboot: company.springboot || "",
                    subscriptionId: company.subscriptionId || 0,
                    directusToken: company.directusToken || "",
                    springbootToken: company.springbootToken || "",
                    status: (company.status as "ACTIVE" | "INACTIVE") || "ACTIVE"
                });
            } else {
                reset(); // Back to default
            }
        }
    }, [isOpen, company, reset]);

    const [isProcessing, setIsProcessing] = React.useState(false);
    
    const onSubmit = async (data: CompanyListInput) => {
        setIsProcessing(true);
        try {
            const success = await onSave(data);
            if (success) {
                onClose();
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const renderInput = (id: keyof CompanyListInput, label: string, type = "text", required = false) => (
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {label} {required && <span className="text-rose-500">*</span>}
            </Label>
            <Input 
                type={type}
                {...register(id)}
                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 focus-visible:ring-primary/50 text-slate-900 dark:text-white"
            />
            {errors[id] && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors[id]?.message as string}</p>}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white p-0 overflow-hidden shadow-2xl">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 w-full shrink-0" />
                <div className="p-6 pb-2 shrink-0">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                            <Building className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            {isEdit ? "Edit Company" : "Register Company"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                            {isEdit ? "Modify the registered details of this company." : "Add a new company to the system."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-6">
                        
                        {/* Company Details */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2">Company Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderInput("companyName", "Company Name", "text", true)}
                                {renderInput("companyCode", "Company Code", "text", true)}
                                
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Company Type <span className="text-rose-500">*</span>
                                    </Label>
                                    <Controller
                                        name="companyTypeId"
                                        control={control}
                                        render={({ field }) => (
                                            <SearchableSelect
                                                options={companyTypes.map(ct => ({
                                                    value: ct.companyTypeId.toString(),
                                                    label: ct.companyTypeName
                                                }))}
                                                value={field.value ? field.value.toString() : ""}
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                placeholder="Select Company Type"
                                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 h-10 text-slate-900 dark:text-white"
                                            />
                                        )}
                                    />
                                    {errors.companyTypeId && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.companyTypeId?.message as string}</p>}
                                </div>

                                {renderInput("companyRegistrationNumber", "Registration Number")}
                                {renderInput("companyTin", "TIN")}
                                {renderInput("companyDateAdmitted", "Date Admitted", "date")}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2">Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-full">
                                    {renderInput("companyAddress", "Street Address")}
                                </div>
                                {renderInput("companyBrgy", "Barangay")}
                                {renderInput("companyCity", "City")}
                                {renderInput("companyProvince", "Province")}
                                {renderInput("companyZipCode", "Zip Code")}
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2">Contact & Social</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderInput("companyContact", "Contact Number")}
                                {renderInput("companyEmail", "Primary Email", "email")}
                                {renderInput("companyOutlook", "Outlook Email", "email")}
                                {renderInput("companyGmail", "Gmail", "email")}
                                {renderInput("companyWebsite", "Website URL", "url")}
                                {renderInput("companyFacebook", "Facebook URL", "url")}
                            </div>
                        </div>

                        {/* System / Internal */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2">System / Internal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderInput("companyDepartment", "Department")}
                                {renderInput("companyTags", "Tags (Comma separated)")}
                                {renderInput("directus", "Directus Reference")}
                                {renderInput("springboot", "Springboot Reference")}
                                
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Subscription <span className="text-rose-500">*</span>
                                    </Label>
                                    <Controller
                                        name="subscriptionId"
                                        control={control}
                                        render={({ field }) => (
                                            <SearchableSelect
                                                options={subscriptions.map(sub => ({
                                                    value: sub.id.toString(),
                                                    label: sub.name
                                                }))}
                                                value={field.value ? field.value.toString() : ""}
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                placeholder="Select Subscription"
                                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 h-10 text-slate-900 dark:text-white"
                                            />
                                        )}
                                    />
                                    {errors.subscriptionId && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.subscriptionId?.message as string}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Status
                                    </Label>
                                    <select 
                                        {...register("status")}
                                        className="w-full h-10 px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white"
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                    {errors.status && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.status.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Tokens (Only show on creation) */}
                        {!isEdit && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2 flex justify-between items-center">
                                    API Tokens 
                                    <span className="text-[10px] text-emerald-500 font-normal lowercase italic tracking-normal">(Tokens are hidden after creation for security)</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderInput("directusToken", "Directus Token", "password")}
                                    {renderInput("springbootToken", "Springboot Token", "password")}
                                </div>
                            </div>
                        )}

                    </form>
                </div>

                <div className="p-6 shrink-0 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f172a]">
                    <DialogFooter className="gap-3 sm:gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing} className="flex-1 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 h-11 text-xs font-bold uppercase text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent">
                            Cancel
                        </Button>
                        <Button type="submit" form="company-form" disabled={isProcessing} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 h-11 text-xs font-bold uppercase shadow-lg shadow-emerald-900/20 text-white">
                            {isProcessing ? "Processing..." : (isEdit ? "Save Changes" : "Register")}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CompanyTypeSchema, CompanyTypeInput } from "../types/company-type.schema"
import { CompanyType } from "../types/company-type.types"
import { Building2 } from "lucide-react"

interface CompanyTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyType?: CompanyType | null;
    onSave: (data: CompanyTypeInput) => Promise<boolean>;
}

export function CompanyTypeModal({ isOpen, onClose, companyType, onSave }: CompanyTypeModalProps) {
    const isEdit = !!companyType;
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CompanyTypeInput>({
        resolver: zodResolver(CompanyTypeSchema),
        defaultValues: {
            companyTypeName: "",
            description: "",
            status: "ACTIVE"
        }
    });

    React.useEffect(() => {
        if (isOpen) {
            if (companyType) {
                reset({
                    companyTypeName: companyType.companyTypeName,
                    description: companyType.description || "",
                    status: (companyType.status as "ACTIVE" | "INACTIVE") || "ACTIVE"
                });
            } else {
                reset({
                    companyTypeName: "",
                    description: "",
                    status: "ACTIVE"
                });
            }
        }
    }, [isOpen, companyType, reset]);

    const [isProcessing, setIsProcessing] = React.useState(false);
    
    const onSubmit = async (data: CompanyTypeInput) => {
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white p-0 overflow-hidden shadow-2xl">
                <div className="h-1 bg-gradient-to-r from-primary to-blue-500 w-full" />
                <div className="p-6 space-y-6">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            {isEdit ? "Edit Company Type" : "Add Company Type"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                            {isEdit ? "Modify the details of this company type." : "Create a new company type classification."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                Company Type Name <span className="text-rose-500">*</span>
                            </Label>
                            <Input 
                                {...register("companyTypeName")}
                                placeholder="e.g. Corporation" 
                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 focus-visible:ring-primary/50 text-slate-900 dark:text-white"
                            />
                            {errors.companyTypeName && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.companyTypeName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                Description
                            </Label>
                            <Textarea 
                                {...register("description")}
                                placeholder="Enter description..." 
                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 focus-visible:ring-primary/50 min-h-[100px] text-xs text-slate-900 dark:text-white"
                            />
                            {errors.description && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.description.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                Status
                            </Label>
                            <select 
                                {...register("status")}
                                className="w-full h-10 px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                            {errors.status && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.status.message}</p>}
                        </div>

                        <DialogFooter className="gap-3 sm:gap-3 mt-6">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing} className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 h-11 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isProcessing} className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 h-11 text-xs font-bold uppercase shadow-lg shadow-primary/20 text-white">
                                {isProcessing ? "Processing..." : (isEdit ? "Save Changes" : "Create")}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

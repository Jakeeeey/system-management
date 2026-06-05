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
import { 
    BlockUserSchema,
    BlockUserInput,
    ForcePasswordResetSchema, 
    ForcePasswordResetInput,
    DirectChangePasswordSchema,
    DirectChangePasswordInput
} from "../types/account.schema"
import { AccountUser } from "../types/account.types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShieldAlert, Key, CheckCircle2, Mail, Info, Lock, Eye, EyeOff } from "lucide-react"

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: AccountUser | null;
    onConfirm: (data: { userId: number; reason?: string; newPassword?: string }) => Promise<boolean>;
}

export function BlockUserModal({ isOpen, onClose, user, onConfirm }: ModalProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<BlockUserInput>({
        resolver: zodResolver(BlockUserSchema),
        defaultValues: { userId: user?.id || 0 }
    });

    React.useEffect(() => {
        if (user) reset({ userId: user.id, reason: "" });
    }, [user, reset]);

    const [isProcessing, setIsProcessing] = React.useState(false);
    const onSubmit = async (data: BlockUserInput) => {
        setIsProcessing(true);
        try {
            const success = await onConfirm(data);
            if (success) onClose();
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white p-0 overflow-hidden shadow-2xl">
                <div className="h-1 bg-gradient-to-r from-rose-500 to-amber-500 w-full" />
                <div className="p-6 space-y-6">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/20">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Block User</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                            Are you sure you want to block <span className="text-slate-900 dark:text-white font-bold">{user.fullName}</span>? This user will no longer be able to access the system.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-white/10">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="bg-purple-600 text-sm font-bold text-white">
                                {user.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName}</span>
                            <span className="text-[11px] text-slate-500 font-mono italic">{user.email}</span>
                            <div className="flex gap-4 mt-1 text-[10px] text-slate-400 font-mono uppercase">
                                <span>Role: {user.role}</span>
                                <span>Pos: {user.position}</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Reason <span className="text-rose-500">*</span></Label>
                            <Textarea 
                                {...register("reason")}
                                placeholder="Enter reason for blocking..." 
                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 focus-visible:ring-rose-500/50 min-h-[100px] text-xs text-slate-900 dark:text-white"
                            />
                            {errors.reason && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.reason.message}</p>}
                        </div>

                        <DialogFooter className="gap-3 sm:gap-3 mt-6">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing} className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 h-11 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isProcessing} className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 h-11 text-xs font-bold uppercase shadow-lg shadow-rose-900/20 text-white">
                                {isProcessing ? "Processing..." : "Block User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function UnblockUserModal({ isOpen, onClose, user, onConfirm }: Omit<ModalProps, 'onConfirm'> & { onConfirm: (data: { userId: number }) => Promise<boolean> }) {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const handleConfirm = async () => {
        if (!user) return;
        setIsProcessing(true);
        try {
            const success = await onConfirm({ userId: user.id });
            if (success) onClose();
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white p-0 overflow-hidden shadow-2xl">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 w-full" />
                <div className="p-6 space-y-6">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Unblock User</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                            Are you sure you want to unblock <span className="text-slate-900 dark:text-white font-bold">{user.fullName}</span>? This user will regain access to the system.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-white/10">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="bg-purple-600 text-sm font-bold text-white">
                                {user.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName}</span>
                            <span className="text-[11px] text-slate-500 font-mono italic">{user.email}</span>
                            <div className="flex gap-4 mt-1 text-[10px] text-slate-400 font-mono uppercase">
                                <span>Role: {user.role}</span>
                                <span>Pos: {user.position}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 sm:gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing} className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 h-11 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleConfirm} disabled={isProcessing} className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 h-11 text-xs font-bold uppercase shadow-lg shadow-emerald-900/20 text-white">
                            {isProcessing ? "Processing..." : "Unblock User"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ForcePasswordResetModal({ isOpen, onClose, user, onConfirm }: ModalProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ForcePasswordResetInput>({
        resolver: zodResolver(ForcePasswordResetSchema),
        defaultValues: { userId: user?.id || 0 }
    });

    React.useEffect(() => {
        if (user) reset({ userId: user.id, reason: "" });
    }, [user, reset]);

    const [isProcessing, setIsProcessing] = React.useState(false);
    const onSubmit = async (data: ForcePasswordResetInput) => {
        setIsProcessing(true);
        try {
            const success = await onConfirm(data);
            if (success) onClose();
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white p-0 overflow-hidden shadow-2xl">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 w-full" />
                <div className="p-6 space-y-6">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                            <Key className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Force Password Reset</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                            Force <span className="text-slate-900 dark:text-white font-bold">{user.fullName}</span> to reset their password on next login.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-white/10">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="bg-purple-600 text-sm font-bold text-white">
                                {user.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName}</span>
                            <span className="text-[11px] text-slate-500 font-mono italic">{user.email}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Reason <span className="text-purple-500">*</span></Label>
                            <Textarea 
                                {...register("reason")}
                                placeholder="Enter reason for reset..." 
                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 focus-visible:ring-purple-500/50 min-h-[100px] text-xs text-slate-900 dark:text-white"
                            />
                            {errors.reason && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.reason.message}</p>}
                        </div>

                        <DialogFooter className="gap-3 sm:gap-3 mt-6">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing} className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 h-11 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isProcessing} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 h-11 text-xs font-bold uppercase shadow-lg shadow-purple-900/20 text-white">
                                {isProcessing ? "Processing..." : "Force Reset"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}



export function SendResetEmailModal({ isOpen, onClose, user, onConfirm }: Omit<ModalProps, 'onConfirm'> & { onConfirm: (data: { userId: number }) => Promise<boolean> }) {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const handleConfirm = async () => {
        if (!user) return;
        setIsProcessing(true);
        try {
            const success = await onConfirm({ userId: user.id });
            if (success) onClose();
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-white dark:bg-[#0c0c14] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-0 overflow-hidden shadow-2xl">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 w-full" />
                <div className="p-6 space-y-6">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-fuchsia-500/20">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Send Password Reset Email</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                            Send a password reset email to <span className="text-slate-900 dark:text-white font-bold">{user.fullName}</span> (<span className="text-slate-500 dark:text-slate-300 italic">{user.email}</span>).
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-3 sm:gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing} className="flex-1 bg-slate-100 dark:bg-white/5 h-11 text-xs font-black uppercase">
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleConfirm} disabled={isProcessing} className="flex-1 bg-gradient-to-r from-fuchsia-600 to-pink-600 h-11 text-xs font-black uppercase text-white shadow-lg">
                            {isProcessing ? "Sending..." : "Send Email"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}



export function PasswordResetOptionsModal({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (action: 'FORCE_RESET' | 'SEND_RESET' | 'DIRECT_CHANGE') => void }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[950px] bg-white dark:bg-[#0c0c14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white p-0 overflow-hidden shadow-2xl">
                <div className="h-1.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 w-full" />
                <div className="p-8 space-y-8">
                    <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-500/20 border border-white/20">
                            <Info className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex flex-col text-left">
                            <DialogTitle className="text-3xl font-black tracking-tight leading-none mb-1">Password Reset Options</DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 text-base font-medium">
                                Choose the reset method for this user
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button 
                            onClick={() => onSelect('FORCE_RESET')}
                            className="bg-slate-50 dark:bg-[#161622] rounded-3xl p-6 border border-slate-200 dark:border-white/5 space-y-6 flex flex-col shadow-sm hover:scale-[1.02] transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
                                    <Key className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-xl font-black">Force Reset</h4>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">User must change password before next login</p>
                        </button>

                        <button 
                            onClick={() => onSelect('SEND_RESET')}
                            className="bg-slate-50 dark:bg-[#161622] rounded-3xl p-6 border border-slate-200 dark:border-white/5 space-y-6 flex flex-col shadow-sm hover:scale-[1.02] transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-fuchsia-600 flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-xl font-black">Send Email</h4>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">User can optionally reset their password via email link</p>
                        </button>

                        <button 
                            onClick={() => onSelect('DIRECT_CHANGE')}
                            className="bg-slate-50 dark:bg-[#161622] rounded-3xl p-6 border border-slate-200 dark:border-white/5 space-y-6 flex flex-col shadow-sm hover:scale-[1.02] transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-xl font-black">Direct Change</h4>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Directly set a new password for the user immediately</p>
                        </button>
                    </div>

                    <Button onClick={onClose} className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl">
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function DirectChangePasswordModal({ isOpen, onClose, user, onConfirm }: Omit<ModalProps, 'onConfirm'> & { onConfirm: (data: { userId: number; newPassword?: string; reason?: string }) => Promise<boolean> }) {
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<DirectChangePasswordInput>({
        resolver: zodResolver(DirectChangePasswordSchema),
        defaultValues: { userId: user?.id || 0, newPassword: "", confirmPassword: "", reason: "Admin reset for compliance" }
    });

    React.useEffect(() => {
        if (user) reset({ userId: user.id, newPassword: "", confirmPassword: "", reason: "Admin reset for compliance" });
    }, [user, reset]);

    const [showNew, setShowNew] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);

    const onSubmit = async (data: DirectChangePasswordInput) => {
        setIsProcessing(true);
        try {
            const success = await onConfirm(data);
            if (success) onClose();
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) return null;

    const newPasswordValue = watch("newPassword") || "";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white p-0 overflow-hidden shadow-2xl">
                <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500 w-full" />
                <div className="p-6 space-y-6">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/20">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Direct Change Password</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                            Change password directly for <span className="text-slate-900 dark:text-white font-bold">{user.fullName}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-white/10">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="bg-purple-600 text-sm font-bold text-white">
                                {user.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName}</span>
                            <span className="text-[11px] text-slate-500 font-mono italic">{user.email}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* New Password */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">New Password <span className="text-rose-500">*</span></Label>
                            <div className="relative">
                                <Input
                                    type={showNew ? "text" : "password"}
                                    placeholder="Enter new password"
                                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 pr-10 text-slate-900 dark:text-white"
                                    {...register("newPassword")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                >
                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.newPassword && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.newPassword.message}</p>}
                        </div>

                        {/* Password Requirements Checklist */}
                        <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg space-y-2 border border-slate-200 dark:border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Password Requirements</p>
                            <div className="grid grid-cols-1 gap-1.5">
                                {[
                                    { label: "At least 15 characters", met: newPasswordValue.length >= 15 },
                                    { label: "One uppercase letter", met: /[A-Z]/.test(newPasswordValue) },
                                    { label: "One lowercase letter", met: /[a-z]/.test(newPasswordValue) },
                                    { label: "One digit (0-9)", met: /\d/.test(newPasswordValue) },
                                    { label: "One special character (!@#$%^&*()_+-=[]{};':\"\\|,.<>?`~)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?`~]/.test(newPasswordValue) },
                                ].map((req, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                                            req.met ? "bg-green-500 scale-125" : "bg-slate-300 dark:bg-white/10"
                                        }`} />
                                        <span className={`text-[10px] transition-colors duration-300 ${
                                            req.met ? "text-green-600 dark:text-green-400 font-bold" : "text-slate-400 dark:text-slate-500"
                                        }`}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Confirm New Password <span className="text-rose-500">*</span></Label>
                            <div className="relative">
                                <Input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Re-enter new password"
                                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 pr-10 text-slate-900 dark:text-white"
                                    {...register("confirmPassword")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Reason <span className="text-rose-500">*</span></Label>
                            <Textarea 
                                {...register("reason")}
                                placeholder="Enter reason for reset..." 
                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 focus-visible:ring-pink-500/50 min-h-[80px] text-xs text-slate-900 dark:text-white"
                            />
                            {errors.reason && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.reason.message}</p>}
                        </div>

                        <DialogFooter className="gap-3 sm:gap-3 mt-6">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing} className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 h-11 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isProcessing} className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 h-11 text-xs font-bold uppercase shadow-lg shadow-pink-900/20 text-white">
                                {isProcessing ? "Processing..." : "Change Password"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}


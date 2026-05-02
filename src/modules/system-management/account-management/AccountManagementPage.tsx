"use client"

import * as React from "react"
import { useAccounts } from "./hooks/useAccounts"
import { AccountTable } from "./components/AccountTable"
import {
    BlockUserModal,
    UnblockUserModal,
    ForcePasswordResetModal,
    SendResetEmailModal,
    PasswordResetOptionsModal
} from "./components/AccountModals"
import { AccountUser, AccountAction } from "./types/account.types"
import { UserCog, ShieldCheck, UserMinus, ShieldAlert, RefreshCcw } from "lucide-react"
import { GlassCard } from "@/components/command-center/GlassCard"
import { Button } from "@/components/ui/button"

export default function AccountManagementPage() {
    const { users, isLoading, executeAction, refresh } = useAccounts();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeTab, setActiveTab] = React.useState("All Users");

    // Modal states
    const [selectedUser, setSelectedUser] = React.useState<AccountUser | null>(null);
    const [activeModal, setActiveModal] = React.useState<AccountAction | 'RESET_OPTIONS' | null>(null);

    // Filter users based on tab and search
    const filteredUsers = React.useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.position.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (activeTab === "All Users") return true;
            if (activeTab === "Active") return user.status === "ACTIVE";
            if (activeTab === "Blocked") return user.status === "BLOCKED";
            if (activeTab === "Locked") return user.status === "LOCKED";

            return true;
        });
    }, [users, searchQuery, activeTab]);

    const counts = React.useMemo(() => ({
        "All Users": users.length,
        "Active": users.filter(u => u.status === "ACTIVE").length,
        "Blocked": users.filter(u => u.status === "BLOCKED").length,
        "Locked": users.filter(u => u.status === "LOCKED").length,
    }), [users]);

    const handleAction = (action: AccountAction | 'RESET_INFO', user: AccountUser) => {
        setSelectedUser(user);
        if (action === 'FORCE_RESET' || action === 'SEND_RESET') {
            setActiveModal('RESET_OPTIONS');
        } else {
            setActiveModal(action as AccountAction);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
                        <UserCog className="w-8 h-8 text-primary" />
                        Account Management
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Manage user accounts, security policies, and access controls from Directus.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => refresh()}
                        variant="outline"
                        className="h-11 px-5 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-widest"
                    >
                        <RefreshCcw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                        Sync Directus
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-5 border-emerald-500/10 shadow-emerald-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Users</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{counts.Active}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-5 border-rose-500/10 shadow-rose-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 shadow-inner">
                            <UserMinus className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blocked Accounts</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{counts.Blocked}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-5 border-amber-500/10 shadow-amber-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Locked Users</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{counts.Locked}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-5 border-indigo-500/10 shadow-indigo-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
                            <UserCog className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Users</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{counts["All Users"]}</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Main Content */}
            <AccountTable
                data={filteredUsers}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAction={(action, user) => handleAction(action, user)}
                counts={counts}
            />

            {/* Modals */}
            <BlockUserModal
                isOpen={activeModal === 'BLOCK'}
                onClose={() => setActiveModal(null)}
                user={selectedUser}
                onConfirm={(data) => executeAction('BLOCK', data)}
            />
            <UnblockUserModal
                isOpen={activeModal === 'UNBLOCK'}
                onClose={() => setActiveModal(null)}
                user={selectedUser}
                onConfirm={(data) => executeAction('UNBLOCK', data)}
            />
            <ForcePasswordResetModal
                isOpen={activeModal === 'FORCE_RESET'}
                onClose={() => setActiveModal(null)}
                user={selectedUser}
                onConfirm={(data) => executeAction('FORCE_RESET', data)}
            />
            <SendResetEmailModal
                isOpen={activeModal === 'SEND_RESET'}
                onClose={() => setActiveModal(null)}
                user={selectedUser}
                onConfirm={(data) => executeAction('SEND_RESET', data)}
            />

            <PasswordResetOptionsModal
                isOpen={activeModal === 'RESET_OPTIONS'}
                onClose={() => setActiveModal(null)}
                onSelect={(action) => setActiveModal(action)}
            />
        </div>
    )
}

function cn(...inputs: (string | boolean | null | undefined)[]) {
    return inputs.filter(Boolean).join(" ");
}

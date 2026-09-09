import { AccountUser } from "../../account-management/types/account.types";

export interface OrderProcessTimeRaw {
    id: number;
    category_name: string;
    category_key: string;
    target_minutes: number;
    accountable_user_id?: number | null;
    description?: string | null;
    is_active?: number | boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface OrderProcessTime {
    id: number;
    categoryName: string;
    categoryKey: string;
    targetMinutes: number;
    accountableUserId?: number | null;
    accountableUser?: AccountUser | null;
    description?: string | null;
    isActive: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
    // Computed formatting
    formattedTime: string;
    stageNumber: number;
}

export interface OrderProcessTimeCategoryMeta {
    key: string;
    name: string;
    defaultMinutes: number;
    description: string;
    icon: string;
    badgeColor: string;
}

export const ORDER_PROCESS_CATEGORIES: OrderProcessTimeCategoryMeta[] = [
    {
        key: "sales_order_creation",
        name: "Sales Order Creation",
        defaultMinutes: 30,
        description: "Initial sales order drafting, line items validation, and customer order placement.",
        icon: "FilePlus2",
        badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
        key: "sales_order_approval",
        name: "Sales Order Approval",
        defaultMinutes: 60,
        description: "Managerial review, pricing check, credit evaluation, and approval sign-off.",
        icon: "ClipboardCheck",
        badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    },
    {
        key: "pdp_creation",
        name: "PDP Creation",
        defaultMinutes: 45,
        description: "Product Delivery Plan & pick document generation for warehouse fulfillment.",
        icon: "FileSpreadsheet",
        badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    },
    {
        key: "picking",
        name: "Picking",
        defaultMinutes: 90,
        description: "Warehouse stock item picking, batch sorting, and bin location retrieval.",
        icon: "PackageSearch",
        badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
        key: "auditing",
        name: "Auditing",
        defaultMinutes: 30,
        description: "Quality assurance inspection, barcode verification, and quantity double-check.",
        icon: "SearchCheck",
        badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
        key: "invoicing",
        name: "Invoicing",
        defaultMinutes: 20,
        description: "Official tax invoice preparation, billing documentation, and receipt stamping.",
        icon: "Receipt",
        badgeColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    },
    {
        key: "budgeting",
        name: "Budgeting",
        defaultMinutes: 45,
        description: "Accounting verification, disbursement alignment, and cost center allocation.",
        icon: "BadgePercent",
        badgeColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    },
    {
        key: "dispatching",
        name: "Dispatching",
        defaultMinutes: 60,
        description: "Staging, delivery vehicle loading, gate pass release, and transit dispatch.",
        icon: "Truck",
        badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    },
];

export function formatMinutesToHuman(minutes: number): string {
    if (!minutes || minutes <= 0) return "0 mins";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0 && remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`;
    }
    if (hours > 0) {
        return `${hours} hr${hours > 1 ? "s" : ""}`;
    }
    return `${minutes} min${minutes > 1 ? "s" : ""}`;
}

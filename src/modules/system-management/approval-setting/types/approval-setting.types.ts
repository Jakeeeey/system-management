export interface ApprovalSettingRaw {
    id: number;
    module_name: string;
    is_approval: number;
}

export interface ApprovalSetting {
    id: number;
    moduleName: string;
    isApproval: boolean;
}

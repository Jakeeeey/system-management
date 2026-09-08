export type SettingCategory = 
    | "localization"
    | "attendance_hardware"
    | "payroll_governance"
    | "system";

export type SettingInputType = "boolean" | "text" | "select" | "number";

export interface GeneralSettingRaw {
    id: number;
    setting_key: string;
    setting_value: string;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface GeneralSetting {
    id: number;
    settingKey: string;
    settingValue: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    // Computed / metadata attributes
    title: string;
    description: string;
    category: SettingCategory;
    inputType: SettingInputType;
    isBoolean: boolean;
    booleanValue: boolean;
}

export interface KnownSettingMeta {
    title: string;
    description: string;
    category: SettingCategory;
    inputType: SettingInputType;
    defaultValue: string;
    icon: string;
    options?: { label: string; value: string }[];
}

export const KNOWN_SETTINGS: Record<string, KnownSettingMeta> = {
    time_zone: {
        title: "System Timezone",
        description: "Standard timezone used for timestamp calculations, audit logs, and attendance clocks across all subsystems.",
        category: "localization",
        inputType: "select",
        defaultValue: "Asia/Manila",
        icon: "Clock",
        options: [
            { label: "Asia/Manila (GMT+8)", value: "Asia/Manila" },
            { label: "UTC (GMT+0)", value: "UTC" },
            { label: "Asia/Singapore (GMT+8)", value: "Asia/Singapore" },
            { label: "Asia/Tokyo (GMT+9)", value: "Asia/Tokyo" },
            { label: "Asia/Hong_Kong (GMT+8)", value: "Asia/Hong_Kong" },
            { label: "America/New_York (EST/EDT)", value: "America/New_York" },
            { label: "America/Los_Angeles (PST/PDT)", value: "America/Los_Angeles" },
            { label: "Europe/London (GMT/BST)", value: "Europe/London" },
            { label: "Australia/Sydney (AEST/AEDT)", value: "Australia/Sydney" },
        ],
    },
    rfid_attendance: {
        title: "RFID Attendance Logging",
        description: "Enables hardware RFID readers to record employee clock-in and clock-out events seamlessly.",
        category: "attendance_hardware",
        inputType: "boolean",
        defaultValue: "1",
        icon: "Radio",
    },
    face_attendance: {
        title: "Facial Recognition Attendance",
        description: "Enables biometric facial recognition checkpoints for attendance capture and identity validation.",
        category: "attendance_hardware",
        inputType: "boolean",
        defaultValue: "1",
        icon: "ScanFace",
    },
    rfid_asset_tagging: {
        title: "RFID Asset Tagging",
        description: "Enables smart RFID scanning and asset inventory tracking across corporate properties.",
        category: "attendance_hardware",
        inputType: "boolean",
        defaultValue: "1",
        icon: "Tag",
    },
    division_name: {
        title: "Division Entity Nomenclature",
        description: "Custom label representing 'Division' across organizational charts, forms, and department management (e.g. 'Division' or 'Sangguniang Bayan').",
        category: "localization",
        inputType: "text",
        defaultValue: "Division",
        icon: "Building2",
    },
    payroll_employee_management_read_only: {
        title: "Payroll Employee Management Read-Only",
        description: "Enforces a strict read-only lock on employee records within the Payroll subsystem to prevent unauthorized modifications.",
        category: "payroll_governance",
        inputType: "boolean",
        defaultValue: "1",
        icon: "Lock",
    },
    payroll_department_management_read_only: {
        title: "Payroll Department Management Read-Only",
        description: "Enforces a strict read-only lock on department structures within the Payroll subsystem.",
        category: "payroll_governance",
        inputType: "boolean",
        defaultValue: "1",
        icon: "ShieldAlert",
    },
};

export const DEFAULT_KEY_SETTINGS = [
    { setting_key: "time_zone", setting_value: "Asia/Manila" },
    { setting_key: "rfid_attendance", setting_value: "1" },
    { setting_key: "face_attendance", setting_value: "1" },
    { setting_key: "rfid_asset_tagging", setting_value: "1" },
    { setting_key: "division_name", setting_value: "Division" },
    { setting_key: "payroll_employee_management_read_only", setting_value: "1" },
    { setting_key: "payroll_department_management_read_only", setting_value: "1" },
];

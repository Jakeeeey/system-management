export interface DirectusUser {
    user_id: number;
    user_email: string;
    user_fname: string;
    user_mname: string | null;
    user_lname: string;
    user_position: string | null;
    user_image: string | null;
    role: string;
    is_blocked: boolean;
    lock_until: string | null;
    failed_attempts: number;
    user_contact?: string | null;
    user_department?: number | null;
    user_dateOfHire?: string | null;
}

export interface AccountUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    position: string;
    role: string;
    image: string | null;
    isBlocked: boolean;
    lockUntil: string | null;
    failedAttempts: number;
    status: 'ACTIVE' | 'BLOCKED' | 'LOCKED';
    dateOfHire?: string | null;
}

export type AccountAction =
    | 'BLOCK'
    | 'UNBLOCK'
    | 'FORCE_RESET'
    | 'SEND_RESET'
    | 'DIRECT_CHANGE'
    | 'VIEW_HISTORY';

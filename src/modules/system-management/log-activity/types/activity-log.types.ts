/**
 * User Activity Log Types
 */

export type ActivityType = 
    | 'LOGIN' 
    | 'LOGOUT' 
    | 'BLOCK' 
    | 'UNBLOCK' 
    | 'FORCE_RESET'
    | 'RESET_EMAIL'
    | 'FORGOT_PASSWORD'
    | 'VERIFY_OTP'
    | 'CHANGE_PASSWORD'
    | 'CREATE_USER'
    | 'UPDATE_USER'
    | 'DELETE_USER'
    | 'PASSWORD_RESET'; // Keeping this as it's in the JSON provided by user.

export type ActivityStatus = 'SUCCESS' | 'FAILED' | 'WARNING' | 'BLOCKED';

export interface ActivityLogEntry {
    id: string;
    userId: number | null;
    userName: string;
    userEmail: string;
    userAvatar?: string;
    type: ActivityType;
    timestamp: string;
    location: string | null;
    ipAddress: string;
    device: string;
    status: ActivityStatus;
    reason?: string;
}


export interface ActivityDashboardStats {
    totalActivities: {
        value: number;
        change: string;
        data: number[];
    };
    activeUsers: {
        value: number;
        change: string;
        data: number[];
    };
    securityEvents: {
        value: number;
        change: string;
        data: number[];
    };
    blockedUsers: {
        value: number;
        change: string;
        data: number[];
    };
}

export interface TimelineData {
    time: string;
    logins: number;
    logouts: number;
    management: number;
    recovery: number;
}

export interface DistributionData {
    name: string;
    value: number;
    color: string;
}

export interface TrendData {
    day: string;
    value: number;
}

export interface SecurityEventData {
    date: string;
    failed: number;
    blocked: number;
    suspicious: number;
}

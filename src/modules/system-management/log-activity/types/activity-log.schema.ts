import { z } from "zod";

/**
 * Activity Log Zod Schemas
 */

export const ActivityLogSchema = z.object({
    id: z.string(),
    userId: z.number().nullable(),
    userName: z.string(),
    userEmail: z.string().email(),
    type: z.enum([
        'LOGIN', 
        'LOGOUT', 
        'BLOCK', 
        'UNBLOCK', 
        'FORCE_RESET',
        'RESET_EMAIL',
        'FORGOT_PASSWORD',
        'VERIFY_OTP',
        'CHANGE_PASSWORD',
        'CREATE_USER',
        'UPDATE_USER',
        'DELETE_USER',
        'PASSWORD_RESET'
    ]),
    timestamp: z.string(),
    location: z.string().nullable(),
    ipAddress: z.string(),
    device: z.string(),
    status: z.enum(['SUCCESS', 'FAILED', 'WARNING', 'BLOCKED']),
    reason: z.string().optional(),
});

export const BlockUserSchema = z.object({
    userId: z.number(),
    reason: z.string().min(1, "Reason is required"),
});

export const ForcePasswordResetSchema = z.object({
    userId: z.number(),
    reason: z.string().min(1, "Reason is required"),
});

export const SetTimeoutSchema = z.object({
    userId: z.number(),
    duration: z.string().min(1, "Duration is required"),
    reason: z.string().min(1, "Reason is required"),
});

export const SendNotificationSchema = z.object({
    userId: z.number(),
    message: z.string().min(1, "Message is required"),
});

export const SecurityReviewSchema = z.object({
    userId: z.number(),
    concerns: z.string().min(1, "Security concerns are required"),
});

export type BlockUserInput = z.infer<typeof BlockUserSchema>;
export type ForcePasswordResetInput = z.infer<typeof ForcePasswordResetSchema>;
export type SetTimeoutInput = z.infer<typeof SetTimeoutSchema>;
export type SendNotificationInput = z.infer<typeof SendNotificationSchema>;
export type SecurityReviewInput = z.infer<typeof SecurityReviewSchema>;

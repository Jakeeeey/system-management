import { z } from "zod";
import { passwordRegex } from "../../change-password/types/change-password.schema";

export const BlockUserSchema = z.object({
    userId: z.number(),
    reason: z.string().min(1, "Reason is required"),
});

export const ForcePasswordResetSchema = z.object({
    userId: z.number(),
    reason: z.string().min(1, "Reason is required"),
});

export const DirectChangePasswordSchema = z.object({
    userId: z.number(),
    newPassword: z.string()
        .min(15, "Password must be at least 15 characters long")
        .max(64, "Password must be no more than 64 characters long")
        .regex(passwordRegex, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
        }),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
    reason: z.string().min(1, "Reason is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type BlockUserInput = z.infer<typeof BlockUserSchema>;
export type ForcePasswordResetInput = z.infer<typeof ForcePasswordResetSchema>;
export type DirectChangePasswordInput = z.infer<typeof DirectChangePasswordSchema>;


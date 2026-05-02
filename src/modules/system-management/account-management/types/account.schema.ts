import { z } from "zod";

export const BlockUserSchema = z.object({
    userId: z.number(),
    reason: z.string().min(1, "Reason is required"),
});

export const ForcePasswordResetSchema = z.object({
    userId: z.number(),
    reason: z.string().min(1, "Reason is required"),
});

export type BlockUserInput = z.infer<typeof BlockUserSchema>;
export type ForcePasswordResetInput = z.infer<typeof ForcePasswordResetSchema>;

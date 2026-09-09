import { z } from "zod";

export const UpdateProcessTimeSchema = z.object({
    id: z.number().int().positive(),
    targetMinutes: z.number().int().min(1, "Target time must be at least 1 minute").max(10080, "Target time cannot exceed 7 days"),
    accountableUserId: z.number().int().positive().nullable().optional(),
    description: z.string().max(255).optional(),
    isActive: z.boolean().optional(),
});

export const QuickAssignUserSchema = z.object({
    id: z.number().int().positive(),
    accountableUserId: z.number().int().positive().nullable(),
});

export const QuickUpdateMinutesSchema = z.object({
    id: z.number().int().positive(),
    targetMinutes: z.number().int().min(1, "Target time must be at least 1 minute").max(10080, "Target time cannot exceed 7 days"),
});

export type UpdateProcessTimeInput = z.infer<typeof UpdateProcessTimeSchema>;
export type QuickAssignUserInput = z.infer<typeof QuickAssignUserSchema>;
export type QuickUpdateMinutesInput = z.infer<typeof QuickUpdateMinutesSchema>;

import { z } from "zod";

export const UpdateSettingSchema = z.object({
    id: z.number().int().positive().optional(),
    settingKey: z.string().min(1, "Setting key is required"),
    settingValue: z.string(),
});

export const ToggleSettingSchema = z.object({
    id: z.number().int().positive().optional(),
    settingKey: z.string().optional(),
    currentValue: z.boolean(),
});

export const CreateSettingSchema = z.object({
    settingKey: z.string().min(1, "Setting key is required").regex(/^[a-z0-9_]+$/, "Key must be lowercase letters, numbers, or underscores"),
    settingValue: z.string(),
});

export type UpdateSettingInput = z.infer<typeof UpdateSettingSchema>;
export type ToggleSettingInput = z.infer<typeof ToggleSettingSchema>;
export type CreateSettingInput = z.infer<typeof CreateSettingSchema>;

import { z } from "zod";

export const ToggleApprovalSchema = z.object({
    id: z.number().int().positive(),
    isApproval: z.number().refine((v) => v === 0 || v === 1, {
        message: "isApproval must be 0 or 1",
    }),
});

export type ToggleApprovalInput = z.infer<typeof ToggleApprovalSchema>;

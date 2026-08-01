import { z } from "zod";

export const CompanyTypeSchema = z.object({
    companyTypeName: z.string().min(1, "Company type name is required"),
    description: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CompanyTypeInput = z.infer<typeof CompanyTypeSchema>;

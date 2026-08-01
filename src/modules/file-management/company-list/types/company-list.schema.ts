import { z } from "zod";

export const CompanyListSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    companyCode: z.string().min(1, "Company code is required"),
    companyTypeId: z.number().min(1, "Company type is required"),
    companyAddress: z.string().optional(),
    companyBrgy: z.string().optional(),
    companyCity: z.string().optional(),
    companyProvince: z.string().optional(),
    companyZipCode: z.string().optional(),
    companyRegistrationNumber: z.string().optional(),
    companyTin: z.string().optional(),
    companyDateAdmitted: z.string().optional(),
    companyContact: z.string().optional(),
    companyEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
    companyOutlook: z.string().email("Invalid email format").optional().or(z.literal("")),
    companyGmail: z.string().email("Invalid email format").optional().or(z.literal("")),
    companyDepartment: z.string().optional(),
    companyLogo: z.string().optional(),
    companyFacebook: z.string().url("Invalid URL").optional().or(z.literal("")),
    companyWebsite: z.string().url("Invalid URL").optional().or(z.literal("")),
    companyTags: z.string().optional(),
    directus: z.string().optional(),
    springboot: z.string().optional(),
    subscriptionId: z.number().optional(),
    directusToken: z.string().optional(),
    springbootToken: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CompanyListInput = z.infer<typeof CompanyListSchema>;

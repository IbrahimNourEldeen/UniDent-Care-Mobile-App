import { z } from "zod";

export const addCaseSchema = z.object({
    PatientId: z.string().min(1, "Invalid Patient ID"),
    Title: z.string().min(3, "Short Title"),
    Description: z.string().min(10, "Short Description"),
    CaseTypeId: z.string().min(1, "Case Type Is Required"),
    Images: z.array(z.any()).optional(),
});

export type AddCaseFormValues = z.infer<typeof addCaseSchema>;
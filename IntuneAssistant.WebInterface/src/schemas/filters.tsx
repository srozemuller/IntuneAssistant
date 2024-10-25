import { z } from "zod";

const filterSchema = z.object({
    id: z.string().uuid(),
    createdDateTime: z.string().datetime(),
    lastModifiedDateTime: z.string().datetime(),
    displayName: z.string().nullable(),
    description: z.string().nullable(),
    platform: z.string().nullable(),
    rule: z.string().nullable(),
    assignmentFilterManagementType: z.string().nullable(),
});

export { filterSchema };
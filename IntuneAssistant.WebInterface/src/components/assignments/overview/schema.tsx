import { z } from "zod";
import { filterSchema } from "@/schemas/filters";
const assignmentsSchema = z.object({
    resourceType: z.string(),
    assignmentType: z.string(),
    platform: z.string().nullable(),
    isAssigned: z.boolean(),
    targetId: z.string(),
    targetName: z.string(),
    resourceId: z.string(),
    resourceName: z.string().nullable(),
    filterId: z.string().nullable(),
    filterType: z.string(),
    filter: filterSchema.nullable()
});

export type Assignments = z.infer<typeof assignmentsSchema>;
export { assignmentsSchema };
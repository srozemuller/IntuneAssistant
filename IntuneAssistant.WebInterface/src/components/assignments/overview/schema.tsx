import { z } from "zod";

const assignmentsSchema = z.object({
    resourceType: z.string(),
    assignmentType: z.string(),
    isAssigned: z.boolean(),
    targetId: z.string(),
    targetName: z.string(),
    resourceId: z.string(),
    resourceName: z.string(),
    filterId: z.string(),
    filterType: z.string()
});

export type Assignments = z.infer<typeof assignmentsSchema>;
export { assignmentsSchema };
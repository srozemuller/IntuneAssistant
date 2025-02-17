import { z } from "zod";

const assignmentSchema = z.object({
    "@odata.type": z.string().nullable(),
    createdDateTime: z.string().nullable(),
    description: z.string().nullable(),
    platform: z.string().nullable(),
    lastModifiedDateTime: z.string().nullable(),
    id: z.string().nullable(),
    assignmentType: z.string().nullable(),
    assignmentDirection: z.string().nullable(),
    enrollmentType: z.string().nullable(),
    isExcluded: z.boolean().nullable(),
    isAssigned: z.boolean().nullable(),
    targetId: z.string().nullable(),
    targetName: z.string().nullable(),
    resourceId: z.string().nullable(),
    resourceName: z.string().nullable(),
    filterId: z.string().nullable(),
    filterType: z.string().nullable(),
    resourceType: z.string().nullable(),
    filter: z.any().nullable()
});

export type Assignment = z.infer<typeof assignmentSchema>;
export { assignmentSchema };
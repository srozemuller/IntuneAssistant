import { z } from "zod";
const assignmentTargetSchema = z.object({
    "@odata.type": z.string(),
    deviceAndAppManagementAssignmentFilterId: z.string().nullable(),
    deviceAndAppManagementAssignmentFilterType: z.string(),
    groupId: z.string(),
});

const assignmentSchema = z.object({
    id: z.string(),
    sourceId: z.string(),
    target: assignmentTargetSchema,
});

const policyRestoreSchema = z.object({
    itemId: z.string(),
    id: z.string(),
    name: z.string(),
    policyType: z.string(),
    assignments: z.array(assignmentSchema),
});

export type policyRestoreModel = z.infer<typeof policyRestoreSchema>;
export { policyRestoreSchema };
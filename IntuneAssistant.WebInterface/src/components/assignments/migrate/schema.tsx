import { z } from "zod";

const assignmentMigrationSchema = z.object({
    resourceType: z.string(),
    currentPolicyId: z.string(),
    currentPolicyName: z.string(),
    currentPolicyAssignments: z.string(),
    assignmentId: z.string(),
    replacementPolicyId: z.string(),
    replacementPolicyName: z.string(),
    replacementPolicyAssignments: z.array(z.string().nullable()),
    isMigrated: z.boolean(),
});

export type AssignmentsMigrationModel = z.infer<typeof assignmentMigrationSchema>;
export { assignmentMigrationSchema };
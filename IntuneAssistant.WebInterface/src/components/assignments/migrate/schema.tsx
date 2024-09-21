import { z } from "zod";

const assignmentMigrationSchema = z.object({
    currentPolicyId: z.string(),
    currentPolicyName: z.string(),
    currentPolicyAssignments: z.string(),
    replacementPolicyId: z.string(),
    replacementPolicyName: z.string(),
    replacementPolicyAssignments: z.string(),
    migrationNeeded: z.boolean(),
});

export type Assignments = z.infer<typeof assignmentMigrationSchema>;
export { assignmentMigrationSchema };


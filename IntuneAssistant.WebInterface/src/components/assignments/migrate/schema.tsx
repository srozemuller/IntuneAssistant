import { z } from "zod";

const migrationCheckResultSchema = z.object({
    sourcePolicyExists: z.boolean(),
    sourcePolicyIsUnique: z.boolean(),
    destinationPolicyExists: z.boolean(),
    destinationPolicyIsUnique: z.boolean(),
    groupExists: z.boolean(),
});

const assignmentMigrationSchema = z.object({
    resourceType: z.string(),
    currentPolicyId: z.string(),
    currentPolicyName: z.string(),
    currentPolicyAssignments: z.array(z.string().nullable()),
    assignmentId: z.string(),
    groupToMigrate: z.string(),
    replacementPolicyId: z.string(),
    replacementPolicyName: z.string(),
    replacementPolicyAssignments: z.array(z.string().nullable()),
    isMigrated: z.boolean(),
    isReadyForMigration: z.boolean(),
    migrationCheckResult: migrationCheckResultSchema.optional(), // Add the new schema here
});

export type AssignmentsMigrationModel = z.infer<typeof assignmentMigrationSchema>;
export { assignmentMigrationSchema, migrationCheckResultSchema };
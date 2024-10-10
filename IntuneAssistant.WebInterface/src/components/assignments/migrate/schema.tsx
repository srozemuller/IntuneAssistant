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

const policySchema = z.object({
    odataType: z.string().nullable(),
    policyType: z.string().nullable(),
    createdDateTime: z.string(),
    creationSource: z.string().nullable(),
    description: z.string().nullable(),
    lastModifiedDateTime: z.string(),
    name: z.string().nullable(),
    settingCount: z.number(),
    id: z.string().nullable(),
    isAssigned: z.boolean(),
    assignments: z.array(assignmentSchema).nullable(),
    settings: z.array(z.unknown()).nullable(),
});

const migrationCheckResultSchema = z.object({
    sourcePolicyExists: z.boolean(),
    sourcePolicyIsUnique: z.boolean(),
    destinationPolicyExists: z.boolean(),
    destinationPolicyIsUnique: z.boolean(),
    groupExists: z.boolean(),
});

const assignmentMigrationSchema = z.object({
    sourcePolicy: policySchema.nullable(),
    sourcePolicyGroups : z.array(z.string()).nullable(),
    destinationPolicy: policySchema.nullable(),
    destinationPolicyGroups: z.array(z.string()).nullable(),
    excludeGroupFromSource: z.boolean(),
    removeGroupFromSource: z.boolean(),
    assignmentId: z.string().nullable(),
    groupToMigrate: z.string(),
    isMigrated: z.boolean(),
    isReadyForMigration: z.boolean(),
    migrationCheckResult: migrationCheckResultSchema.optional(),
});

export type AssignmentsMigrationModel = z.infer<typeof assignmentMigrationSchema>;
export { assignmentMigrationSchema, migrationCheckResultSchema };
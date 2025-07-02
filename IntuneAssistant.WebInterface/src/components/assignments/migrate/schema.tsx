import { z } from "zod";

const groupsSchema = z.object({
    id : z.string(),
    displayName: z.string(),
    description: z.string(),
    createdDateTime: z.string(),
});

const assignmentTargetSchema = z.object({
    "@odata.type": z.string(),
    deviceAndAppManagementAssignmentFilterId: z.string().nullable(),
    deviceAndAppManagementAssignmentFilterType: z.string(),
    groupId: z.string().optional(), // is optional because it depends on the target type
});

const assignmentSchema = z.object({
    id: z.string(),
    sourceId: z.string(),
    target: assignmentTargetSchema,
});

const policySchema = z.object({
    "@odata.type": z.string().nullable(),
    policyType: z.string().nullable(),
    policySubType: z.string().nullable(),
    createdDateTime: z.string().nullable(),
    description: z.string().nullable(),
    lastModifiedDateTime: z.string().nullable(),
    name: z.string().nullable(),
    settingCount: z.number(),
    id: z.string().nullable(),
    isAssigned: z.boolean(),
    assignments: z.array(assignmentSchema.nullable()).nullable(),
    settings: z.array(z.unknown()).nullable(),
});

const migrationCheckResultSchema = z.object({
    policyExists: z.boolean(),
    policyIsUnique: z.boolean(),
    groupExists: z.boolean(),
    correctAssignmentTypeProvided: z.boolean(),
    correctAssignmentActionProvided: z.boolean(),
    filterExist:z.boolean(),
    filterIsUnique: z.boolean(),
    correctFilterPlatform: z.boolean(),
    correctFilterTypeProvided: z.boolean(),
});

const assignmentFilterSchema = z.object({
    id: z.string().nullable(),
    displayName: z.string().nullable(),
    description: z.string().nullable(),
    platform: z.string().nullable(),
    rule: z.string().nullable(),
    assignmentFilterManagementType: z.string().nullable(),
});

const assignmentMigrationSchema = z.object({
    id: z.string(),
    providedPolicyName: z.string(),
    policy: policySchema.nullable(),
    assignedGroups: z.array(z.string().nullable()).nullable(),
    excludeGroupFromSource: z.boolean(),
    removeGroupFromSource: z.boolean(),
    assignmentId: z.string().nullable(),
    groupToMigrate: z.string().nullable(),
    assignmentType: z.string(),
    assignmentDirection: z.string().nullable(),
    assignmentAction: z.string(),
    filterToMigrate: assignmentFilterSchema.nullable(),
    filterName: z.string().nullable(),
    filterType: z.string().nullable(),
    isMigrated: z.boolean(),
    isReadyForMigration: z.boolean(),
    migrationCheckResult: migrationCheckResultSchema.optional(),
});

export type AssignmentsMigrationModel = z.infer<typeof assignmentMigrationSchema>;
export type AssignmentsFiltersModel = z.infer<typeof assignmentFilterSchema>;
export { assignmentMigrationSchema, migrationCheckResultSchema, groupsSchema, assignmentFilterSchema };
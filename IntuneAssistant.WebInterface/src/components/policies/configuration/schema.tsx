// src/components/policies/configuration/schema.tsx
import { z } from "zod";
import { settingSchema } from "@/schemas/policySettingSchema.tsx";


export const assignmentSchema = z.object({
    id: z.string(),
    sourceId: z.string(),
    target: z.object({
        "@odata.type": z.string(),
        deviceAndAppManagementAssignmentFilterId: z.string().nullable(),
        deviceAndAppManagementAssignmentFilterType: z.string(),
        groupId: z.string()
    }),
    resourceType: z.string().optional(),
    assignmentType: z.string().optional(),
    isAssigned: z.boolean().optional(),
    targetId: z.string().optional(),
    targetName: z.string().optional(),
    resourceId: z.string().optional(),
    resourceName: z.string().optional(),
    filterId: z.string().optional(),
    filterType: z.string().optional()
});

export const policySchema = z.object({
    odataType: z.string().nullable(),
    policyType: z.string(),
    createdDateTime: z.string(),
    creationSource: z.string().nullable(),
    description: z.string().nullable(),
    platforms: z.string().nullable(),
    lastModifiedDateTime: z.string(),
    name: z.string(),
    settingCount: z.number(),
    id: z.string(),
    isAssigned: z.boolean(),
    assignments: z.array(assignmentSchema),
    settings: z.array(z.any()).nullable()
});


export type Policy = z.infer<typeof policySchema>;

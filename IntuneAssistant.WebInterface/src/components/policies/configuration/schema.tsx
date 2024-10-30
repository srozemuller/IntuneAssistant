// src/components/policies/configuration/schema.tsx
import { z } from "zod";

const assignmentSchema = z.object({
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

const policySchema = z.object({
    policyType: z.string().nullable(),
    createdDateTime: z.string(),
    creationSource: z.string().nullable(),
    description: z.string().nullable(),
    lastModifiedDateTime: z.string(),
    name: z.string().nullable(),
    settingCount: z.number(),
    id: z.string(),
    assignments: z.array(assignmentSchema),
    settings: z.array(z.unknown()),
    isAssigned: z.boolean()
});

export type Policy = z.infer<typeof policySchema>;
export { policySchema };
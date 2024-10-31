// src/components/policies/configuration/schema.tsx
import { z } from "zod";
import { settingSchema } from "@/schemas/policySettingSchema.tsx";

const assignmentSchema = z.object({
    resourceType: z.string().nullable(),
    assignmentType: z.string().nullable(),
    isAssigned: z.boolean().nullable(),
    targetId: z.string().nullable(),
    targetName: z.string().nullable(),
    resourceId: z.string().nullable(),
    resourceName: z.string().nullable(),
    filterId: z.string().nullable(),
    filterType: z.string().nullable()
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
    settings: z.array(settingSchema).nullable(),
    isAssigned: z.boolean()
});

export type Policy = z.infer<typeof policySchema>;
export { policySchema };
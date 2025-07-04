import { z } from "zod";

// Define the group count schema
const groupCountSchema = z.object({
    userCount: z.number(),
    deviceCount: z.number(),
    groupCount: z.number()
});

// Define the group schema
const groupSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    description: z.string(),
    createdDateTime: z.string(),
    groupCount: groupCountSchema,
    members: z.array(z.any()).nullable()
});

// Assignment schema matching your actual API response
export const assignmentSchema = z.object({
    resourceType: z.string(),
    resourceSubType: z.string().nullable(),
    platform: z.string(),
    assignmentType: z.string(),
    assignmentDirection: z.string(),
    isExcluded: z.boolean(),
    isAssigned: z.boolean(),
    targetId: z.string(),
    targetName: z.string(),
    resourceId: z.string(),
    resourceName: z.string(),
    filterId: z.string().nullable(),
    filterType: z.string(),
    filter: z.any().nullable(),
    group: groupSchema.nullable()
});

export type Assignment = z.infer<typeof assignmentSchema>;
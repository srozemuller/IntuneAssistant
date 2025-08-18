import { z } from "zod";
import {groupSchema} from "@/schemas/groupSchema.tsx";

// Define the group count schema
const groupCountSchema = z.object({
    userCount: z.number(),
    deviceCount: z.number(),
    groupCount: z.number()
});


// Assignment schema matching your actual API response
const assignmentSchema = z.object({
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

export type Assignments = z.infer<typeof assignmentSchema>;
export { assignmentSchema };
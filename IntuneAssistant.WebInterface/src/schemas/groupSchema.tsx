import { z } from "zod";

// Define GroupMemberModel schema (assuming structure)
const groupMemberSchema = z.object({
    id: z.string().uuid(),
    displayName: z.string(),
    accountEnabled: z.boolean(),
    createdDateTime: z.string(),
    type: z.string(),
});

// Define GroupModel schema
const groupSchema = z.object({
    id: z.string().uuid().default("00000000-0000-0000-0000-000000000000"),
    displayName: z.string().default(""),
    description: z.string().default("").nullable(),
    membershipRule: z.string().default("").nullable(),
    createdDateTime: z.string().default(""),
    groupCount: z.object({
        userCount: z.number(),
        deviceCount: z.number(),
        groupCount: z.number(),
    }).nullable(),
    members: z.array(groupMemberSchema).nullable()
});

export type GroupModel = z.infer<typeof groupSchema>;
export type GroupMemberModel = z.infer<typeof groupMemberSchema>;
export { groupSchema, groupMemberSchema };
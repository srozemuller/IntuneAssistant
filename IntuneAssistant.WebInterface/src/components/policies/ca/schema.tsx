import { z } from "zod"

export const userReadableSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    // Add other fields as necessary
});


export const conditionSchema = z.object({
    users: z.object({
        includeUsersReadable: z.array(userReadableSchema).optional(),
        excludeUsersReadable: z.array(userReadableSchema).optional(),
        includeGroupsReadable: z.array(userReadableSchema).optional(),
        excludeGroupsReadable: z.array(userReadableSchema).optional(),
        }
    )
    // Add other fields as necessary
});

export const taskSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    state: z.string(),
    createdDateTime: z.string(),
    modifiedDateTime: z.string(),
    conditions: conditionSchema.optional()
});

export type Task = z.infer<typeof taskSchema>
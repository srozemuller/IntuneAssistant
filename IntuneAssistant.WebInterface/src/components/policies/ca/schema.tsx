import { z } from "zod"

export const userReadableSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    // Add other fields as necessary
});

export const deviceFilterSchema = z.object({
    mode: z.string().optional(),
    rule: z.string().optional(),
});

export const devicesSchema = z.object({
    includeDeviceStates: z.array(z.string()).optional(),
    excludeDeviceStates: z.array(z.string()).optional(),
    includeDevices: z.array(z.string()).optional(),
    excludeDevices: z.array(z.string()).optional(),
    deviceFilter: deviceFilterSchema.optional(),
});

export const conditionSchema = z.object({
    devices: devicesSchema.nullable(),
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
    createdDateTime: z.string().nullable(),
    modifiedDateTime: z.string().nullable(),
    conditions: conditionSchema,
    sessionControls: z.any().optional(),
    grantControls: z.any().optional(),
});

export type Task = z.infer<typeof taskSchema>
export type DeviceFilter = z.infer<typeof deviceFilterSchema>;
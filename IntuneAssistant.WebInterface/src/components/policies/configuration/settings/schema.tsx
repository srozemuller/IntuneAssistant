import { z } from "zod";

const childSettingInfoSchema = z.object({
    '@odata.type': z.string().nullable(),
    name: z.string().nullable(),
    value: z.string().nullable()
});

const settingSchema = z.object({
    id: z.string().nullable(),
    policyId: z.string().nullable(),
    policyName: z.string(),
    settingName: z.string().nullable(),
    settingValue: z.string().nullable(),
    childSettingInfo: z.array(childSettingInfoSchema).nullable(),
    settingDefinitions: z.unknown().nullable()
});

export type PolicySettings = z.infer<typeof settingSchema>;
export { settingSchema };
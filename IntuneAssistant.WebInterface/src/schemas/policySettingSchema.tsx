import { z } from "zod";

const childSettingInfoSchema = z.object({
    odatatype: z.string(),
    name: z.string(),
    value: z.string()
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

export type PolicySettingsSchema = z.infer<typeof settingSchema>;
export { settingSchema };
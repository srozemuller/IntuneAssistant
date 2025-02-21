import { z } from "zod";

const valuesSchema = z.object({
    sourceValue: z.string(),
    checkedValue: z.string()
});

const childSettingSchema = z.object({
    name: z.string(),
    value: z.string()
});

const checkResultSchema = z.object({
    name: z.string(),
    id: z.string(),
    definitionId: z.string(),
    values: valuesSchema,
    description: z.string(),
    differences: z.string(),
    settingCheckState: z.string(),
    childSettings: z.array(childSettingSchema)
});

const policyComparisonSchema = z.object({
    sourcePolicyId: z.string(),
    sourcePolicyName: z.string(),
    checkedPolicyId: z.string(),
    checkedPolicyName: z.string(),
    checkResults: z.array(checkResultSchema)
});

export type PolicyComparison = z.infer<typeof policyComparisonSchema>;
export { policyComparisonSchema };
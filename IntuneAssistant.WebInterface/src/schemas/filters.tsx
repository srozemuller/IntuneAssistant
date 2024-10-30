import { z } from "zod";
import {assignmentsSchema} from "@/components/assignments/overview/schema.tsx";

const filterSchema = z.object({
    id: z.string().uuid(),
    createdDateTime: z.string().datetime(),
    lastModifiedDateTime: z.string().datetime(),
    displayName: z.string().nullable(),
    description: z.string().nullable(),
    platform: z.string().nullable(),
    rule: z.string().nullable(),
    assignmentFilterManagementType: z.string().nullable(),
});
export type Filters = z.infer<typeof filterSchema>;
export { filterSchema };
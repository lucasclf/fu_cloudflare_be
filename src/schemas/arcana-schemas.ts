import { z } from "zod";
import { successResponseSchema } from "./common";

export const arcanaSchema = z.object({
    id: z.number(),
    name: z.string(),
    domain: z.string(),
    merge_effect: z.string().nullable(),
    dismiss_effect: z.string().nullable(),
    special_rule: z.string().nullable(),
});

export const createArcanaSchema = z.object({
    name: z.string().min(1),
    domain: z.string().min(1),
    merge_effect: z.string().nullable().optional().default(null),
    dismiss_effect: z.string().nullable().optional().default(null),
    special_rule: z.string().nullable().optional().default(null),
});

export const arcanaListResponse = successResponseSchema(z.array(arcanaSchema));

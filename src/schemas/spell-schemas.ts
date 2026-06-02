import { z } from "zod";
import { successResponseSchema } from "./common";

export const spellSchema = z.object({
    id: z.number(),
    job_id: z.number().nullable(),
    name: z.string(),
    description: z.string(),
    is_offensive: z.boolean(),
    cost: z.string().nullable(),
    target: z.string().nullable(),
    duration: z.string().nullable(),
    nature: z.enum(["job", "monster"]),
});

export const createSpellSchema = z.object({
    job_id: z.number().int().positive(),
    name: z.string().min(1),
    description: z.string().min(1),
    is_offensive: z.boolean().default(false),
    cost: z.string().min(1),
    target: z.string().min(1),
    duration: z.string().min(1),
});

export const spellListResponse = successResponseSchema(z.array(spellSchema));

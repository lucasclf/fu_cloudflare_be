import { z } from "zod";
import { successResponseSchema } from "./common";

export const powerWithJobSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    type: z.enum(["common", "heroic"]),
    max_level: z.number(),
    is_global: z.boolean(),
    job_name: z.array(z.string()),
});

export const createPowerSchema = z.object({
    job_id: z.array(z.number().int().positive()).min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    type: z.enum(["common", "heroic"]),
    max_level: z.number().int().min(0),
    is_global: z.boolean().default(false),
});

export const powerListResponse = successResponseSchema(z.array(powerWithJobSchema));

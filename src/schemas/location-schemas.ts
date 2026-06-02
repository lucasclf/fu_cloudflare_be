import { z } from "zod";
import { successResponseSchema } from "./common";

const locationTypeSchema = z.enum(["region", "city", "village", "dungeon", "landmark", "building", "other"]);

export const locationSchema = z.object({
    id: z.number(),
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    img_key: z.string().nullable(),
    location_type: locationTypeSchema,
    created_at: z.string(),
    updated_at: z.string().nullable(),
});

export const createLocationSchema = z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    description: z.string().min(1),
    img_key: z.string().nullable().optional().default(null),
    location_type: locationTypeSchema,
});

export const locationListResponse = successResponseSchema(z.array(locationSchema));
export const locationResponse = successResponseSchema(locationSchema);

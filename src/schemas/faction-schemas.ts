import { z } from "zod";
import { successResponseSchema } from "./common";

const factionTypeSchema = z.enum(["guild", "kingdom", "order", "cult", "clan", "company", "criminal", "military", "other"]);
const factionLocationRelationTypeSchema = z.enum(["headquarters", "origin", "territory", "influence", "presence", "enemy_presence", "other"]);

export const factionLocationRelationSchema = z.object({
    location_id: z.number(),
    location_name: z.string(),
    relation_type: factionLocationRelationTypeSchema,
});

export const factionBaseSchema = z.object({
    id: z.number(),
    name: z.string(),
    tagline: z.string().nullable(),
    description: z.string().nullable(),
    img_key: z.string().nullable(),
    faction_type: factionTypeSchema,
    created_at: z.string(),
    updated_at: z.string().nullable(),
});

export const factionResponseSchema = factionBaseSchema.extend({
    location_relations: z.array(factionLocationRelationSchema),
});

export const createFactionSchema = z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    description: z.string().min(1),
    img_key: z.string().nullable().optional().default(null),
    faction_type: factionTypeSchema,
    faction_location_relation: z.array(
        z.object({
            location_id: z.number().int().positive(),
            relation_type: factionLocationRelationTypeSchema,
        }),
    ).default([]),
});

export const factionIdParamSchema = z.object({
    factionId: z.string().regex(/^\d+$/, "factionId must be a positive integer"),
});

export const factionListResponse = successResponseSchema(z.array(factionResponseSchema));
export const factionResponse = successResponseSchema(factionResponseSchema);

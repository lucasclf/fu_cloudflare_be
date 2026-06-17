import { z } from "zod";
import { attributeDieSchema, successResponseSchema } from "./common";

const monsterTypeSchema = z.enum(["construct", "demon", "elemental", "beast", "humanoid", "monster", "undead", "plant"]);
export const affinityTypeSchema = z.enum(["normal", "vulnerable", "resistant", "immune", "absorbs"]);
export const actionTypeSchema = z.enum(["basic_attack", "spell", "other_action", "special_rule"]);
export const actionIconSchema = z.enum(["melee", "ranged", "spell", "support", "passive"]);
export const damageTypeSchema = z.enum(["physical", "air", "bolt", "dark", "earth", "fire", "ice", "light", "poison"]);

export const monsterSummarySchema = z.object({
    id: z.number(),
    name: z.string(),
    level: z.number().nullable(),
    monster_type: monsterTypeSchema,
    is_villain: z.boolean(),
    dexterity_die: attributeDieSchema,
    insight_die: attributeDieSchema,
    might_die: attributeDieSchema,
    willpower_die: attributeDieSchema,
    img_key: z.string().nullable(),
});

export const monsterTraitSchema = z.object({
    monster_id: z.number(),
    trait: z.string(),
});

export const monsterAffinitySchema = z.object({
    monster_id: z.number(),
    physical: affinityTypeSchema,
    air: affinityTypeSchema,
    bolt: affinityTypeSchema,
    dark: affinityTypeSchema,
    earth: affinityTypeSchema,
    fire: affinityTypeSchema,
    ice: affinityTypeSchema,
    light: affinityTypeSchema,
    poison: affinityTypeSchema,
});

export const monsterActionSchema = z.object({
    id: z.number(),
    monster_id: z.number(),
    action_type: actionTypeSchema,
    action_icon: actionIconSchema.nullable(),
    name: z.string(),
    description: z.string(),
    check_formula: z.string().nullable(),
    accuracy_bonus: z.number().nullable(),
    damage_type: damageTypeSchema.nullable(),
    cost: z.string().nullable(),
    target: z.string().nullable(),
    duration: z.string().nullable(),
    is_offensive: z.boolean(),
});

export const monsterFullSchema = monsterSummarySchema.extend({
    description: z.string(),
    hp: z.number(),
    mp: z.number(),
    initiative: z.number(),
    defense: z.number(),
    magic_defense: z.number(),
    equipment: z.string().nullable(),
    source_page: z.number().nullable(),
    ultima_points: z.number(),
    strategy: z.string().nullable(),
    traits: z.array(monsterTraitSchema).optional(),
    affinities: monsterAffinitySchema.optional(),
    actions: z.array(monsterActionSchema).optional(),
});

export const createMonsterSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    monster_type: monsterTypeSchema,
    level: z.number().int().min(1),
    dexterity_die: attributeDieSchema,
    insight_die: attributeDieSchema,
    might_die: attributeDieSchema,
    willpower_die: attributeDieSchema,
    hp: z.number().int().positive(),
    mp: z.number().int().min(0),
    initiative: z.number().int(),
    defense: z.number().int().min(0),
    magic_defense: z.number().int().min(0),
    is_villain: z.boolean().default(false),
    ultima_points: z.number().int().min(0).default(0),
    strategy: z.string().nullable().optional().default(null),
    equipment: z.string().nullable().optional().default(null),
    source_page: z.number().int().nullable().optional().default(null),
    img_key: z.string().nullable().optional().default(null),
});

export const createMonsterTraitSchema = z.object({
    monster_id: z.number().int().positive(),
    trait: z.string().min(1),
});

export const createMonsterAffinitySchema = z.object({
    monster_id: z.number().int().positive(),
    physical: affinityTypeSchema,
    air: affinityTypeSchema,
    bolt: affinityTypeSchema,
    dark: affinityTypeSchema,
    earth: affinityTypeSchema,
    fire: affinityTypeSchema,
    ice: affinityTypeSchema,
    light: affinityTypeSchema,
    poison: affinityTypeSchema,
});

export const createMonsterActionSchema = z.object({
    monster_id: z.number().int().positive(),
    action_type: actionTypeSchema,
    action_icon: actionIconSchema.nullable().optional().default(null),
    name: z.string().min(1),
    description: z.string().min(1),
    check_formula: z.string().nullable().optional().default(null),
    accuracy_bonus: z.number().int().nullable().optional().default(null),
    damage_type: damageTypeSchema.nullable().optional().default(null),
    cost: z.string().nullable().optional().default(null),
    target: z.string().nullable().optional().default(null),
    duration: z.string().nullable().optional().default(null),
    is_offensive: z.boolean().default(false),
});

export const monsterIncludeQuerySchema = z.object({
    include: z.string().optional(),
});

export const monsterListResponse = successResponseSchema(z.array(monsterFullSchema));
export const monsterSummaryListResponse = successResponseSchema(z.array(monsterSummarySchema));
export const monsterResponse = successResponseSchema(monsterFullSchema);
export const monsterActionListResponse = successResponseSchema(z.array(monsterActionSchema));

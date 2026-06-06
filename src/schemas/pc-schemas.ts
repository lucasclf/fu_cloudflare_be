import { z } from "zod";
import { attributeDieSchema, successResponseSchema } from "./common";
import { itemSchema } from "./item-schemas";
import { arcanaSchema } from "./job-schemas";
import { spellSchema } from "./spell-schemas";

const bondTargetTypeSchema = z.enum(["pc", "npc", "monster", "freeform"]);
const admirationAxisSchema = z.enum(["admiration", "inferiority"]);
const loyaltyAxisSchema = z.enum(["loyalty", "mistrust"]);
const affectionAxisSchema = z.enum(["affection", "hatred"]);

export const pcSummarySchema = z.object({
    id: z.number(),
    name: z.string(),
    tagline: z.string().nullable(),
    dexterity_die: attributeDieSchema,
    insight_die: attributeDieSchema,
    might_die: attributeDieSchema,
    willpower_die: attributeDieSchema,
    img_key: z.string().nullable(),
});

const pcStatsSchema = z.object({
    level: z.number(),
    hp: z.number(),
    mp: z.number(),
    initiative: z.number(),
    ip: z.number(),
    defense: z.number(),
    magic_defense: z.number(),
});

const pcCapacitiesSchema = z.object({
    hp_bonus: z.number(),
    mp_bonus: z.number(),
    ip_bonus: z.number(),
    allows_martial_armor: z.boolean(),
    allows_martial_shield: z.boolean(),
    allows_martial_ranged_weapon: z.boolean(),
    allows_martial_melee_weapon: z.boolean(),
    allows_arcane: z.boolean(),
    allows_rituals: z.boolean(),
    allows_monster_spells: z.boolean(),
    can_start_projects: z.boolean(),
});

const pcBondSchema = z.object({
    id: z.number(),
    pc_id: z.number(),
    target_type: bondTargetTypeSchema,
    target_id: z.number().nullable(),
    target_name: z.string().nullable(),
    admiration_axis: admirationAxisSchema.nullable(),
    loyalty_axis: loyaltyAxisSchema.nullable(),
    affection_axis: affectionAxisSchema.nullable(),
    description: z.string().nullable(),
    img_key: z.string().nullable(),
});

export const pcFullSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    tagline: z.string().nullable(),
    pronouns: z.string().nullable(),
    origin: z.string().nullable(),
    identity: z.string().nullable(),
    theme: z.string().nullable(),
    money: z.number(),
    img_key: z.string().nullable(),
    dexterity_die: attributeDieSchema.nullable(),
    insight_die: attributeDieSchema.nullable(),
    might_die: attributeDieSchema.nullable(),
    willpower_die: attributeDieSchema.nullable(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
    stats: pcStatsSchema,
    pc_capacities: pcCapacitiesSchema,
    jobs: z.array(z.object({
        id: z.number(), name: z.string(), level: z.number(),
        ignore_hp_bonus: z.boolean(), ignore_mp_bonus: z.boolean(),
    }).passthrough()).optional(),
    powers: z.array(z.object({ id: z.number(), name: z.string(), level: z.number().nullable() }).passthrough()).optional(),
    spells: z.array(spellSchema).optional(),
    monsterSpells: z.array(spellSchema).optional(),
    arcanas: z.array(arcanaSchema).optional(),
    equipment: z.object({
        pc_id: z.number(),
        main_hand: itemSchema.nullable(),
        off_hand: itemSchema.nullable(),
        armor: itemSchema.nullable(),
        accessory: itemSchema.nullable(),
    }).optional(),
    inventories: z.array(z.object({ pc_id: z.number(), item: itemSchema, quantity: z.number() })).optional(),
    bonds: z.array(pcBondSchema).optional(),
});

export const createPcSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    tagline: z.string().nullable().optional().default(null),
    pronouns: z.string().nullable().optional().default(null),
    origin: z.string().min(1),
    identity: z.string().min(1),
    theme: z.string().min(1),
    dexterity_die: attributeDieSchema,
    insight_die: attributeDieSchema,
    might_die: attributeDieSchema,
    willpower_die: attributeDieSchema,
    money: z.number().int().min(0).default(0),
    img_key: z.string().nullable().optional().default(null),
    // user_id nunca vem do body — é sempre injetado pelo handler via JWT
});

export const createPcJobRelationSchema = z.object({
    pc_id: z.number().int().positive(),
    job_id: z.number().int().positive(),
    level: z.number().int().min(1).max(10),
    ignore_hp_bonus: z.boolean().default(false),
    ignore_mp_bonus: z.boolean().default(false),
});

export const createPcPowerRelationSchema = z.object({
    pc_id: z.number().int().positive(),
    power_id: z.number().int().positive(),
    level: z.number().int().min(1),
});

export const createPcSpellRelationSchema = z.object({
    pc_id: z.number().int().positive(),
    spell_id: z.number().int().positive(),
});

export const createPcArcanaRelationSchema = z.object({
    pc_id: z.number().int().positive(),
    arcana_id: z.number().int().positive(),
    description: z.string().nullable().optional().default(null),
});

export const createPcEquipmentSchema = z.object({
    pc_id: z.number().int().positive(),
    main_hand: z.number().int().positive().nullable().optional().default(null),
    off_hand: z.number().int().positive().nullable().optional().default(null),
    armor: z.number().int().positive().nullable().optional().default(null),
    accessory: z.number().int().positive().nullable().optional().default(null),
});

export const createPcInventorySchema = z.object({
    pc_id: z.number().int().positive(),
    item_id: z.number().int().positive(),
    quantity: z.number().int().positive(),
});

export const createPcBondSchema = z.object({
    pc_id: z.number().int().positive(),
    target_type: bondTargetTypeSchema,
    target_id: z.number().int().positive().nullable().optional().default(null),
    target_name: z.string().nullable().optional().default(null),
    admiration_axis: admirationAxisSchema.nullable().optional().default(null),
    loyalty_axis: loyaltyAxisSchema.nullable().optional().default(null),
    affection_axis: affectionAxisSchema.nullable().optional().default(null),
    description: z.string().nullable().optional().default(null),
});

export const createPcMonsterSpellSchema = z.object({
    pc_id: z.number().int().positive(),
    monster_action_id: z.number().int().positive(),
});

export const pcSummaryListResponse = successResponseSchema(z.array(pcSummarySchema));
export const pcFullResponse = successResponseSchema(pcFullSchema);

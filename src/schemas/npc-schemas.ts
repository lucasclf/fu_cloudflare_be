import { z } from "zod";
import { attributeDieSchema, successResponseSchema } from "./common";
import { itemSchema } from "./item-schemas";

const specialRulesTypeSchema = z.enum(["bonus", "attack", "penalty", "passive", "reaction", "condition", "note"]);
const inventoryTypeSchema = z.enum(["inventory", "shop_stock"]);

export const npcSummarySchema = z.object({
    id: z.number(),
    name: z.string(),
    tagline: z.string().nullable(),
    level: z.number().nullable(),
    dexterity_die: attributeDieSchema.nullable(),
    insight_die: attributeDieSchema.nullable(),
    might_die: attributeDieSchema.nullable(),
    willpower_die: attributeDieSchema.nullable(),
    img_key: z.string().nullable(),
});

export const npcFullSchema = npcSummarySchema.extend({
    description: z.string(),
    hp: z.number().nullable(),
    mp: z.number().nullable(),
    initiative: z.number().nullable(),
    defense: z.number().nullable(),
    magic_defense: z.number().nullable(),
    specialRules: z.array(z.object({
        id: z.number(),
        type: specialRulesTypeSchema,
        title: z.string(),
        description: z.string(),
    })).optional(),
    inventory: z.array(z.object({
        item: itemSchema,
        relation_type: inventoryTypeSchema,
        quantity: z.number(),
    })).optional(),
    equipment: z.object({
        npc_id: z.number(),
        main_hand: itemSchema.nullable(),
        off_hand: itemSchema.nullable(),
        armor: itemSchema.nullable(),
        accessory: itemSchema.nullable(),
    }).optional(),
});

export const createNpcSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    tagline: z.string().nullable().optional().default(null),
    level: z.number().int().nullable().optional().default(null),
    dexterity_die: attributeDieSchema.nullable().optional().default(null),
    insight_die: attributeDieSchema.nullable().optional().default(null),
    might_die: attributeDieSchema.nullable().optional().default(null),
    willpower_die: attributeDieSchema.nullable().optional().default(null),
    hp: z.number().int().nullable().optional().default(null),
    mp: z.number().int().nullable().optional().default(null),
    initiative: z.number().int().nullable().optional().default(null),
    defense: z.number().int().nullable().optional().default(null),
    magic_defense: z.number().int().nullable().optional().default(null),
    img_key: z.string().nullable().optional().default(null),
});

export const createNpcSpecialRuleSchema = z.object({
    npc_id: z.number().int().positive(),
    type: specialRulesTypeSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    metadata: z.record(z.string(), z.unknown()).nullable().optional().default(null),
});

export const createNpcInventorySchema = z.object({
    npc_id: z.number().int().positive(),
    item_id: z.number().int().positive(),
    relation_type: inventoryTypeSchema,
    quantity: z.number().int().positive(),
});

export const createNpcEquipmentSchema = z.object({
    npc_id: z.number().int().positive(),
    main_hand: z.number().int().positive().nullable().optional().default(null),
    off_hand: z.number().int().positive().nullable().optional().default(null),
    armor: z.number().int().positive().nullable().optional().default(null),
    accessory: z.number().int().positive().nullable().optional().default(null),
});

const npcSpecialRuleBodySchema = createNpcSpecialRuleSchema.omit({ npc_id: true });
const npcInventoryBodySchema = createNpcInventorySchema.omit({ npc_id: true });
const npcEquipmentBodySchema = createNpcEquipmentSchema.omit({ npc_id: true }).refine(
    (eq) => eq.main_hand !== null || eq.off_hand !== null || eq.armor !== null || eq.accessory !== null,
    { message: "Equipamento deve ter ao menos um slot preenchido" },
);

export const createCampaignNpcSchema = createNpcSchema.extend({
    specialRules: z.array(npcSpecialRuleBodySchema).optional().default([]),
    inventory: z.array(npcInventoryBodySchema).optional().default([]),
    equipment: npcEquipmentBodySchema.nullable().optional().default(null),
});

export const npcIncludeQuerySchema = z.object({
    include: z.string().optional(),
});

export const npcSummaryListResponse = successResponseSchema(z.array(npcSummarySchema));
export const npcResponse = successResponseSchema(npcFullSchema);

import { z } from "zod";
import { successResponseSchema } from "./common";

const itemTypeSchema = z.enum(["arma", "armadura", "escudo", "acessorio", "artefato", "outros"]);
const weaponCategorySchema = z.enum(["arcana", "arco", "luta", "adaga", "arma_de_fogo", "malho", "pesado", "lança", "espada", "arremesso"]);
const damageTypeSchema = z.enum(["physical", "air", "bolt", "dark", "earth", "fire", "ice", "light", "poison"]);

export const itemSchema = z.object({
    id: z.number(),
    name: z.string(),
    item_type: itemTypeSchema,
    description: z.string().nullable(),
    img_key: z.string().nullable(),
    cost: z.number().nullable(),
    weapon_category: weaponCategorySchema.nullable(),
    accuracy: z.string().nullable(),
    damage: z.string().nullable(),
    damage_type: damageTypeSchema.nullable(),
    grip: z.string().nullable(),
    distance: z.string().nullable(),
    defense_dice: z.string().nullable(),
    defense_bonus: z.number().nullable(),
    magic_defense_dice: z.string().nullable(),
    magic_defense_bonus: z.number().nullable(),
    initiative: z.string().nullable(),
    is_martial: z.boolean().nullable(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
});

export const createItemSchema = z.object({
    name: z.string().min(1),
    item_type: itemTypeSchema,
    description: z.string().nullable().optional().default(null),
    img_key: z.string().nullable().optional().default(null),
    cost: z.number().int().nullable().optional().default(null),
    weapon_category: weaponCategorySchema.nullable().optional().default(null),
    accuracy: z.string().nullable().optional().default(null),
    damage: z.string().nullable().optional().default(null),
    damage_type: damageTypeSchema.nullable().optional().default(null),
    grip: z.string().nullable().optional().default(null),
    distance: z.string().nullable().optional().default(null),
    defense_dice: z.string().nullable().optional().default(null),
    defense_bonus: z.number().int().nullable().optional().default(null),
    magic_defense_dice: z.string().nullable().optional().default(null),
    magic_defense_bonus: z.number().int().nullable().optional().default(null),
    initiative: z.string().nullable().optional().default(null),
    is_martial: z.boolean().nullable().optional().default(null),
});

export const itemNameParamSchema = z.object({
    itemName: z.string().min(1),
});

export const itemListResponse = successResponseSchema(z.array(itemSchema));
export const itemResponse = successResponseSchema(itemSchema);

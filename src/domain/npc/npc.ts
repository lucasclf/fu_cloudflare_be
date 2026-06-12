import { Character, CharacterSummary, CreateCharacterInput, CreateFullCharacterInput } from "../domain-types";
import { Item } from "../items/item";

export type NpcInclude = "rules" | "inventories" | "equipments";


export const ALLOWED_SPECIAL_RULES_TYPE = [
    "bonus",
    "attack",
    "penalty",
    "passive",
    "reaction",
    "condition",
    "note"
] as const;

export type SpecialRulesType = (typeof ALLOWED_SPECIAL_RULES_TYPE)[number];

export const ALLOWED_INVENTORY_TYPE = [
    "inventory",
    "shop_stock"
] as const;

export type InventoryType = (typeof ALLOWED_INVENTORY_TYPE)[number];

export interface Npc extends Character {
    level: number | null;
    tagline: string | null
}

export interface NpcSummary extends CharacterSummary {
    level: number | null;
    tagline: string | null
}

export interface NpcSpecialRules {
    id: number;
    npc_id: number;
    type: SpecialRulesType;
    title: string;
    description: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface NpcInventoryRelation {
    npc_id: number;
    item_id: number;
    relation_type: InventoryType;
    quantity: number;
}

export interface NpcInventory {
	npc_id: number;
	item: Item;
	relation_type: InventoryType;
	quantity: number;
}

export interface NpcEquipment {
	npc_id: number;
	main_hand: Item | null;
	off_hand: Item | null;
	armor: Item | null;
	accessory: Item | null;
}

export interface NpcFull extends Npc {
    specialRules?: NpcSpecialRules[],
    inventory?: NpcInventory[],
    equipment?: NpcEquipment
}

export interface CreateNpcInput extends CreateFullCharacterInput {
    tagline: string | null
}

export interface CreateSpecialRulesInput {
    npc_id: number;
    type: SpecialRulesType;
    title: string;
    description: string;
    metadata: Record<string, unknown> | null;
}

export interface CreateNpcInventoryInput {
    npc_id: number;
    item_id: number;
    relation_type: InventoryType;
    quantity: number;
}

export interface CreateNpcEquipmentInput {
    npc_id: number;
    main_hand: number | null;
    off_hand: number | null;
    armor: number | null;
    accessory: number | null;
}
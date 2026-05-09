import { Character, CharacterSummary, CreateCharacterInput } from "../domain-types";

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

export const ALLOWED_EQUIPMENT_SLOT_TYPE = [
    "main_hand",
    "off_hand",
    "armor_slot",
    "accessory_slot"
] as const;

export type SlotType = (typeof ALLOWED_EQUIPMENT_SLOT_TYPE)[number];

export interface Npc extends Omit<Character, "crisis_hp"> {
    tagline: string | null
}

export interface NpcSummary extends CharacterSummary {
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

export interface NpcInventory {
    npc_id: number;
    item_id: number;
    relation_type: InventoryType;
    quantity: number;
}

export interface NpcEquipment {
    npc_id: number;
    item_id: number;
    slot: SlotType;
}

export interface NpcFull extends Npc {
    specialRules?: NpcSpecialRules[],
    inventory?: NpcInventory[]
    equipment?: NpcEquipment[]
}

export interface CreateNpcInput extends Omit<CreateCharacterInput, "crisis_hp"> {
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
    slot: SlotType;
    item_id: number;
}

export interface NpcSpecialRulesRow {
    id: number;
    npc_id: number;
    type: SpecialRulesType;
    title: string;
    description: string;
    metadata: string | null;
    created_at: string;
    updated_at: string;
}
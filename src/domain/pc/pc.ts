import { Character, CharacterSummary, CreateCharacterInput } from "../domain-types";
import { Item } from "../items/item";
import { Arcana, JobPower, ResumeJob } from "../jobs/job";
import { MonsterSpell, Spell } from "../spells/spells";

export const ALLOWED_BOND_TARGET_TYPE = ["pc" , "npc" , "monster", "freeform"]  as const;

export type TargetType = (typeof ALLOWED_BOND_TARGET_TYPE)[number];

export const ALLOWED_BOND_ADMIRATION = ["admiration" , "inferiority"]  as const;

export type AdmirationAxys = (typeof ALLOWED_BOND_ADMIRATION)[number];

export const ALLOWED_BOND_LOYALTY = ["loyalty" , "mistrust"]  as const;

export type LoyaltyAxis = (typeof ALLOWED_BOND_LOYALTY)[number];

export const ALLOWED_BOND_AFFECTION = ["affection" , "hatred"]  as const;

export type AffectionAxys = (typeof ALLOWED_BOND_AFFECTION)[number];

export interface PC extends Character {
    tagline: string | null,
    pronouns: string | null,
    origin: string,
    identity: string,
    theme: string,
    money: number
}

export interface CreatePCInput extends CreateCharacterInput {
    tagline: string | null,
    pronouns: string | null,
    origin: string,
    identity: string,
    theme: string,
    money: number,
    user_id: number, // sempre injetado pelo handler via JWT, nunca vem do body
}

export type UpdatePCInput = Omit<CreatePCInput, "user_id">;

export interface PcJobRelation {
    pc_id: number,
    job_id: number,
    level: number,
    ignore_hp_bonus: boolean,
	ignore_mp_bonus: boolean,
}

export interface PcPowerRelation {
    pc_id: number,
    power_id: number,
    level: number
}

export interface CreatePcSpellRelationInput {
    pc_id: number,
    spell_id: number
}

export interface CreatePcMonsterSpellRelationInput {
    pc_id: number,
    monster_action_id: number
}

export interface CreatePcArcanaRelationInput {
    pc_id: number,
    arcana_id: number,
    description: string | null
}

export interface CreatePcEquipmentInput {
    pc_id: number,
    main_hand: number | null,
    off_hand: number | null,
    armor: number | null,
    accessory: number | null
}

export interface CreatePcInventoryInput {
    pc_id: number,
    item_id: number,
    quantity: number
}

export interface PcBondInput {
    pc_id: number,
    target_type: TargetType,
    target_id: number | null,
    target_name: string | null,
    admiration_axis: AdmirationAxys | null,
    loyalty_axis: LoyaltyAxis | null,
    affection_axis: AffectionAxys | null,
    description: string | null
}

export type BondTargetSummary = {
	id: number;
	name: string;
	img_key: string | null;
};

export interface PcBond {
    id: number,
    pc_id: number,
    target_type: TargetType,
    target_id: number | null,
    target_name: string | null,
    admiration_axis: AdmirationAxys | null,
    loyalty_axis: LoyaltyAxis | null,
    affection_axis: AffectionAxys | null,
    description: string | null,
    img_key: string | null
}

export interface PcSummary extends CharacterSummary {
    tagline: string | null,
}

export interface Pc extends Character {
    pronouns: string | null,
    tagline: string | null,
    origin: string | null,
    identity: string | null,
    theme: string | null,
    money: number,
    user_id: number,
    pc_capacities: PcCapacities,
}

export interface PcCapacities {
    hp_bonus: number;
	mp_bonus: number;
	ip_bonus: number;
	allows_martial_armor: boolean;
	allows_martial_shield: boolean;
	allows_martial_ranged_weapon: boolean;
	allows_martial_melee_weapon: boolean;
	allows_arcane: boolean;
	allows_rituals: boolean;
	allows_monster_spells: boolean;
	can_start_projects: boolean;
}

export interface PcCalculatedStats {
	level: number;
	hp: number;
	mp: number;
	initiative: number;
	ip: number;
	defense: number;
	magic_defense: number;
}

export interface PcFull extends Pc {
    stats: PcCalculatedStats,
    jobs?: PcJobInfo[],
    powers?: PcPowerInfo[],
    spells?: Spell[],
    monsterSpells?: MonsterSpell[],
    arcanas?: Arcana[],
    equipment?: PcEquipment,
    inventories?: PcInventory[],
    bonds?: PcBond[]
}

export interface PcJobInfo extends ResumeJob {
    level: number,
    ignore_hp_bonus: boolean,
	ignore_mp_bonus: boolean,
}

export interface PcPowerInfo extends JobPower {
    level: number | null,
}

export interface PcEquipment {
    pc_id: number,
    main_hand: Item | null,
    off_hand: Item | null,
    armor: Item | null,
    accessory: Item | null
}

export interface PcInventory {
    pc_id: number,
    item: Item,
    quantity: number
}

export interface PcBase extends PC {
    id: number,
    user_id: number,
}
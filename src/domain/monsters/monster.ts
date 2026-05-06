import { Character, CharacterSummary, CreateCharacterInput } from "../domain-types";

export type MonsterInclude = "traits" | "affinities" | "actions";

export const ALLOWED_MONSTER_TYPE = [
    "construct",
    "demon",
    "elemental",
    "beast",
    "humanoid",
    "monster",
    "undead",
     "plant"
]

export type MonsterType = (typeof ALLOWED_MONSTER_TYPE)[number];

export const ALLOWED_MONSTER_AFFINITY = [
    "normal", "vulnerable", "resistant", "immune", "absorbs"
]

export type MonsterAffinityType = (typeof ALLOWED_MONSTER_AFFINITY[number])

export const ALLOWED_MONSTER_ACTION_TYPE = [
    "basic_attack", "spell", "other_action", "special_rule"
]

export type MonsterActionType = (typeof ALLOWED_MONSTER_ACTION_TYPE[number])

export const ALLOWED_MONSTER_ACTION_ICON = [
    "melee", "ranged", "spell", "support", "passive"
]

export type MonsterActionIcon = (typeof ALLOWED_MONSTER_ACTION_ICON[number])

export const ALLOWED_MONSTER_DAMAGE_TYPE = [
    "physical", "air", "bolt", "dark", "earth", "fire", "ice", "light", "poison"
]

export type MonsterDamageType = (typeof ALLOWED_MONSTER_DAMAGE_TYPE[number])

export interface MonsterTrait {
    monster_id: number;
    trait: string;
}

export interface MonsterAffinity {
    monster_id: number;
    physical: MonsterAffinityType;
    air: MonsterAffinityType;
    bolt: MonsterAffinityType;
    dark: MonsterAffinityType;
    earth: MonsterAffinityType;
    fire: MonsterAffinityType;
    ice: MonsterAffinityType;
    light: MonsterAffinityType;
    poison: MonsterAffinityType;
}

export interface MonsterAction {
    id: number;
    monster_id: number;
    action_type: MonsterActionType; 
    action_icon: MonsterActionIcon | null;
    name: string;
    description: string;
    check_formula: string | null;
    accuracy_bonus: number | null;
    damage_type: MonsterDamageType | null;
    cost: string | null;
    target: string | null;
    duration:string | null;
    is_offensive: boolean
}

export interface CreateAffinityInput {
    monster_id: number;
    physical: MonsterAffinityType;
    air: MonsterAffinityType;
    bolt: MonsterAffinityType;
    dark: MonsterAffinityType;
    earth: MonsterAffinityType;
    fire: MonsterAffinityType;
    ice: MonsterAffinityType;
    light: MonsterAffinityType;
    poison: MonsterAffinityType;
}

export interface Monster extends Character {
    monster_type: MonsterType;
    equipment: string;
    source_page: number;
}

export interface MonsterFull extends Monster {
    traits?: MonsterTrait[];
    affinities?: MonsterAffinity[];
    actions?: MonsterAction[];
}

export interface MonsterSummary extends CharacterSummary {
    monster_type: MonsterType;
}

export interface CreateMonsterInput extends CreateCharacterInput {
    monster_type: MonsterType;
    equipment: string | null;
    source_page: number | null;
}

export interface CreateMonsterTraitInput {
    monster_id: number,
    trait: string
}

export interface CreateAffinityInput {
    monster_id: number;
    physical: MonsterAffinityType;
    air: MonsterAffinityType;
    bolt: MonsterAffinityType;
    dark: MonsterAffinityType;
    earth: MonsterAffinityType;
    fire: MonsterAffinityType;
    ice: MonsterAffinityType;
    light: MonsterAffinityType;
    poison: MonsterAffinityType
}

export interface CreateActionInput {
    monster_id: number;
    action_type: MonsterActionType; 
    action_icon: MonsterActionIcon | null;
    name: string;
    description: string;
    check_formula: string | null;
    accuracy_bonus: number | null;
    damage_type: MonsterDamageType | null;
    cost: string | null;
    target: string | null;
    duration:string | null;
    is_offensive: boolean
}
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

export interface MonsterTrait {
    monster_id: number;
    trait: string;
}

export interface Monster extends Character {
    monster_type: MonsterType;
    equipment: string;
    source_page: number;
}

export interface MonsterFull extends Monster {
    traits?: MonsterTrait[]
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
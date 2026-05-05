export const ALLOWED_ATTRIBUTE_DIE = [
    "d6", "d8", "d10", "d12"
]

export type AttributeDie = (typeof ALLOWED_ATTRIBUTE_DIE)[number];

export interface Character {
    id: number;
    name: string;
    description: string;
    level: number;
    dexterity_die: AttributeDie;
    insight_die: AttributeDie;
    might_die: AttributeDie;
    willpower_die: AttributeDie;
    hp: number;
    crisis_hp: number;
    mp: number;
    initiative: number;
    defense: number;
    magic_defense: number;
    img_key: string;
    created_at: string;
    updated_at: string | null;
}

export interface CharacterSummary {
    id: number;
    name: string;
    level: number;
    dexterity_die: AttributeDie;
    insight_die: AttributeDie;
    might_die: AttributeDie;
    willpower_die: AttributeDie;
}

export interface CreateCharacterInput {
    name: string;
    description: string;
    level: number;
    dexterity_die: AttributeDie;
    insight_die: AttributeDie;
    might_die: AttributeDie;
    willpower_die: AttributeDie;
    hp: number;
    crisis_hp: number;
    mp: number;
    initiative: number;
    defense: number;
    magic_defense: number;
    img_key: string | null;
}
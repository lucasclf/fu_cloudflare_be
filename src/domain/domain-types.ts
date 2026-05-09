export const ALLOWED_ATTRIBUTE_DIE = [
    "d6", "d8", "d10", "d12"
] as const;

export type AttributeDie = (typeof ALLOWED_ATTRIBUTE_DIE)[number];

export interface Character {
    id: number;
    name: string;
    description: string;
    level: number | null;
    dexterity_die: AttributeDie | null;
    insight_die: AttributeDie | null;
    might_die: AttributeDie | null;
    willpower_die: AttributeDie | null;
    hp: number | null;
    crisis_hp: number | null;
    mp: number | null;
    initiative: number | null;
    defense: number | null;
    magic_defense: number | null;
    img_key: string | null;
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
    img_key: string;
}

export interface CreateCharacterInput {
    name: string;
    description: string;
    level: number | null;
    dexterity_die: AttributeDie | null;
    insight_die: AttributeDie | null;
    might_die: AttributeDie | null;
    willpower_die: AttributeDie | null;
    hp: number | null;
    crisis_hp: number | null;
    mp: number | null;
    initiative: number | null;
    defense: number | null;
    magic_defense: number | null;
    img_key: string | null;
}
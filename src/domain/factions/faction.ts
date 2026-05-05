export const ALLOWED_FACTION_TYPES = [
    "guild",
    "kingdom",
    "order",
    "cult",
    "clan",
    "company",
    "criminal",
    "military",
    "other"
] as const;

export type FactionType = (typeof ALLOWED_FACTION_TYPES)[number];

export const ALLOWED_FACTION_LOCATION_RELATION_TYPES = [
    "headquarters",
    "origin",
    "territory",
    "influence",
    "presence",
    "enemy_presence",
    "other"
] as const;

export type FactionLocationRelationType = (typeof ALLOWED_FACTION_LOCATION_RELATION_TYPES)[number];


export type CreateFactionLocationRelation = {
    location_id: number;
    relation_type: FactionLocationRelationType;
}

export interface FactionBase {
	id: number;
	name: string;
	tagline: string;
	description: string;
	img_key: string | null;
	faction_type: FactionType;
	created_at: string;
	updated_at: string | null;
};

export interface Faction {
    id: number;
    name: string;
    tagline: string;
	description: string;
    img_key: string | null;

    faction_type: FactionType;
    location_relations: FactionLocationRelation[];

    created_at: string;
	updated_at: string | null;
}

export interface FactionLocationRelation {
    location_id: Number;
    location_name: string;
    relation_type: FactionLocationRelationType;
}

export interface CreateFactionInput {
    name: string;
    tagline: string;
	description: string;
    img_key: string | null;

    faction_type: FactionType;
    faction_location_relation: CreateFactionLocationRelation[]
}
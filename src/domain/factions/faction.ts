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

export type Faction = {
    id: number;
    name: string;
    tagline: string;
	description: string;
    img_key: string | null;

    location_type: FactionType;

    created_at: string;
	updated_at: string | null;
}

export interface CreateFactionInput {
    name: string;
    tagline: string;
	description: string;
    img_key: string | null;

    faction_type: FactionType;
    locations_id: number[];
}
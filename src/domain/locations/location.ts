export const ALLOWED_LOCATION_TYPES = [
    "region",
    "city",
    "village",
    "dungeon",
    "landmark",
    "building",
    "other"
] as const;

export type LocationType = (typeof ALLOWED_LOCATION_TYPES)[number];

export type Location = {
    id: number;
    name: string;
    tagline: string;
	description: string;
    img_key: string | null;

    location_type: LocationType;

    created_at: string;
	updated_at: string | null;
}

export interface CreateLocationInput {
    name: string;
    tagline: string;
	description: string;
    img_key: string | null;

    location_type: LocationType;
}
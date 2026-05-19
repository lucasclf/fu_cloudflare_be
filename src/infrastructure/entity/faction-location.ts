export type FactionLocationRelationEntity = {
	faction_id: number;
	location_id: number;
	location_name: string;
	relation_type: string;
};

export type FactionEntity = {
    id: number;
    name: string;
    tagline: string;
    description: string;
    img_key: string | null;
    faction_type: string;
    created_at: string;
    updated_at: string | null;
};

export type LocationEntity = {
    id: number;
    name: string;
    tagline: string;
    description: string;
    img_key: string | null;
    location_type: string;
    created_at: string;
    updated_at: string | null;
};

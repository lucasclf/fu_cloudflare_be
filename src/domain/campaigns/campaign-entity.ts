export const ENTITY_TYPES = [
    "session", "npc", "monster", "location",
    "faction", "item", "job", "spell", "power", "arcana",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export interface CampaignEntity {
    id: number;
    campaign_id: number;
    entity_type: EntityType;
    entity_id: number;
    visible_to_players: boolean;
    created_at: string;
}

export interface LinkEntityInput {
    campaign_id: number;
    entity_type: EntityType;
    entity_id: number;
    visible_to_players: boolean;
}

export interface UnlinkEntityInput {
    campaign_id: number;
    entity_type: EntityType;
    entity_id: number;
}

export interface CampaignPc {
    campaign_id: number;
    pc_id: number;
    visible_to_players: boolean;
    created_at: string;
}

export interface LinkPcInput {
    campaign_id: number;
    pc_id: number;
    visible_to_players: boolean;
}

export interface UpdateCampaignPcInput {
    visible_to_players: boolean;
}

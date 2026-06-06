import type { D1Boolean } from "../d1-utils";

export type CampaignEntityRow = {
    id: number;
    campaign_id: number;
    entity_type: string;
    entity_id: number;
    visible_to_players: D1Boolean;
    created_at: string;
};

export type CampaignPcRow = {
    campaign_id: number;
    pc_id: number;
    visible_to_players: D1Boolean;
    created_at: string;
};

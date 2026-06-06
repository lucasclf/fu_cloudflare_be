export const CAMPAIGN_ROLES = ["master", "player"] as const;
export type CampaignRole = (typeof CAMPAIGN_ROLES)[number];

export interface CampaignMember {
    id: number;
    campaign_id: number;
    user_id: number;
    role: CampaignRole;
    created_at: string;
    updated_at: string | null;
}

export interface AddCampaignMemberInput {
    campaign_id: number;
    user_id: number;
    role: CampaignRole;
}

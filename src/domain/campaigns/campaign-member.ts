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

export interface UserCampaignSummary {
    id: number;
    name: string;
    description: string | null;
    img_key: string | null;
    status: string;
    role: CampaignRole;
    joined_at: string;
}

export interface MemberWithNickname {
    user_id: number;
    role: CampaignRole;
    nickname: string;
    pc_id: number | null;
    pc_name: string | null;
}

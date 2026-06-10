export const CAMPAIGN_STATUSES = ["active", "hiatus", "completed"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export interface Campaign {
    id: number;
    name: string;
    description: string | null;
    img_key: string | null;
    status: CampaignStatus;
    master_notes: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface CreateCampaignInput {
    name: string;
    description: string | null;
    img_key: string | null;
}

export type UpdateCampaignInput = CreateCampaignInput;

export interface UpdateCampaignNotesInput {
    master_notes: string | null;
    status?: CampaignStatus;
}

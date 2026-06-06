export interface Campaign {
    id: number;
    name: string;
    description: string | null;
    img_key: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface CreateCampaignInput {
    name: string;
    description: string | null;
    img_key: string | null;
}

export type UpdateCampaignInput = CreateCampaignInput;

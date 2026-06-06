import type { AddCampaignMemberInput, CampaignMember, CampaignRole } from "../../domain/campaigns/campaign-member";

export interface CampaignMemberRepositoryPort {
    findByCampaignId(campaignId: number): Promise<CampaignMember[]>;
    findByUserAndCampaign(userId: number, campaignId: number): Promise<CampaignMember | null>;
    add(input: AddCampaignMemberInput): Promise<void>;
    updateRole(campaignId: number, userId: number, role: CampaignRole): Promise<void>;
    remove(campaignId: number, userId: number): Promise<void>;
}

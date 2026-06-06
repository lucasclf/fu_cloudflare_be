import type { AddCampaignMemberInput, CampaignMember, CampaignRole } from "../domain/campaigns/campaign-member";
import { MemberNotFoundError } from "../domain/campaigns/campaign-member-errors";
import { CampaignNotFoundError } from "../domain/campaigns/campaign-errors";
import type { CampaignReaderPort } from "./ports/campaign-ports";
import type { CampaignMemberRepositoryPort } from "./ports/campaign-member-ports";

export class CampaignMemberService {
    constructor(
        private readonly campaignRepo: CampaignReaderPort,
        private readonly memberRepo: CampaignMemberRepositoryPort,
    ) {}

    async listMembers(campaignId: number): Promise<CampaignMember[]> {
        await this.assertCampaignExists(campaignId);
        return await this.memberRepo.findByCampaignId(campaignId);
    }

    async addMember(input: AddCampaignMemberInput): Promise<void> {
        await this.assertCampaignExists(input.campaign_id);
        await this.memberRepo.add(input);
    }

    async updateMemberRole(campaignId: number, userId: number, role: CampaignRole): Promise<void> {
        await this.assertCampaignExists(campaignId);
        await this.assertMemberExists(campaignId, userId);
        await this.memberRepo.updateRole(campaignId, userId, role);
    }

    async removeMember(campaignId: number, userId: number): Promise<void> {
        await this.assertCampaignExists(campaignId);
        await this.assertMemberExists(campaignId, userId);
        await this.memberRepo.remove(campaignId, userId);
    }

    private async assertCampaignExists(campaignId: number): Promise<void> {
        const c = await this.campaignRepo.findById(String(campaignId));
        if (!c) throw new CampaignNotFoundError(campaignId);
    }

    private async assertMemberExists(campaignId: number, userId: number): Promise<void> {
        const m = await this.memberRepo.findByUserAndCampaign(userId, campaignId);
        if (!m) throw new MemberNotFoundError(userId, campaignId);
    }
}

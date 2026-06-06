import type { AddCampaignMemberInput, CampaignMember, CampaignRole } from "../../domain/campaigns/campaign-member";
import { MemberAlreadyExistsError } from "../../domain/campaigns/campaign-member-errors";
import type { CampaignMemberRepositoryPort } from "../../application/ports/campaign-member-ports";

export class D1CampaignMemberRepository implements CampaignMemberRepositoryPort {
    constructor(private readonly db: D1Database) {}

    async findByCampaignId(campaignId: number): Promise<CampaignMember[]> {
        const { results } = await this.db
            .prepare("SELECT id, campaign_id, user_id, role, created_at, updated_at FROM campaign_members WHERE campaign_id = ? ORDER BY created_at ASC")
            .bind(campaignId)
            .all<CampaignMember>();
        return results;
    }

    async findByUserAndCampaign(userId: number, campaignId: number): Promise<CampaignMember | null> {
        return await this.db
            .prepare("SELECT id, campaign_id, user_id, role, created_at, updated_at FROM campaign_members WHERE user_id = ? AND campaign_id = ? LIMIT 1")
            .bind(userId, campaignId)
            .first<CampaignMember>();
    }

    async add(input: AddCampaignMemberInput): Promise<void> {
        try {
            await this.db
                .prepare("INSERT INTO campaign_members (campaign_id, user_id, role) VALUES (?, ?, ?)")
                .bind(input.campaign_id, input.user_id, input.role)
                .run();
        } catch (error) {
            if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
                throw new MemberAlreadyExistsError(input.user_id, input.campaign_id);
            }
            throw error;
        }
    }

    async updateRole(campaignId: number, userId: number, role: CampaignRole): Promise<void> {
        await this.db
            .prepare("UPDATE campaign_members SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE campaign_id = ? AND user_id = ?")
            .bind(role, campaignId, userId)
            .run();
    }

    async remove(campaignId: number, userId: number): Promise<void> {
        await this.db
            .prepare("DELETE FROM campaign_members WHERE campaign_id = ? AND user_id = ?")
            .bind(campaignId, userId)
            .run();
    }
}

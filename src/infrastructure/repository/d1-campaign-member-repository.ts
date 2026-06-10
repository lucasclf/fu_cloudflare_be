import type { AddCampaignMemberInput, CampaignMember, CampaignRole, MemberWithNickname, UserCampaignSummary } from "../../domain/campaigns/campaign-member";
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

    async countMasterCampaigns(userId: number): Promise<number> {
        const row = await this.db
            .prepare("SELECT COUNT(*) AS total FROM campaign_members WHERE user_id = ? AND role = 'master'")
            .bind(userId)
            .first<{ total: number }>();
        return row?.total ?? 0;
    }

    async findCampaignsByUserId(userId: number): Promise<UserCampaignSummary[]> {
        const { results } = await this.db
            .prepare(`
                SELECT c.id, c.name, c.description, c.img_key, c.status, cm.role, cm.created_at AS joined_at
                FROM campaign_members cm
                JOIN campaigns c ON c.id = cm.campaign_id
                WHERE cm.user_id = ?
                ORDER BY CASE cm.role WHEN 'master' THEN 0 ELSE 1 END, c.name ASC
            `)
            .bind(userId)
            .all<UserCampaignSummary>();
        return results;
    }

    async findMembersWithNicknames(campaignId: number): Promise<MemberWithNickname[]> {
        const { results } = await this.db
            .prepare(`
                SELECT cm.user_id, cm.role, u.nickname,
                    (SELECT p.id FROM pcs p
                     JOIN campaign_pcs cp ON cp.pc_id = p.id
                     WHERE cp.campaign_id = cm.campaign_id AND p.user_id = cm.user_id
                     LIMIT 1) AS pc_id,
                    (SELECT p.name FROM pcs p
                     JOIN campaign_pcs cp ON cp.pc_id = p.id
                     WHERE cp.campaign_id = cm.campaign_id AND p.user_id = cm.user_id
                     LIMIT 1) AS pc_name
                FROM campaign_members cm
                JOIN users u ON u.id = cm.user_id
                WHERE cm.campaign_id = ?
                ORDER BY CASE cm.role WHEN 'master' THEN 0 ELSE 1 END, u.nickname ASC
            `)
            .bind(campaignId)
            .all<MemberWithNickname>();
        return results;
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

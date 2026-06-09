import type {
    CampaignInvitation,
    CampaignInvitationSummary,
    CampaignInvitationWithInvitee,
    CreateInvitationInput,
    InvitationStatus,
} from "../../domain/campaigns/invitation";
import type { CampaignInvitationRepositoryPort } from "../../application/ports/campaign-invitation-ports";

type InvitationRow = {
    id: number;
    campaign_id: number;
    inviter_id: number;
    invitee_id: number;
    status: string;
    created_at: string;
    updated_at: string | null;
};

export class D1CampaignInvitationRepository implements CampaignInvitationRepositoryPort {
    constructor(private readonly db: D1Database) {}

    async create(input: CreateInvitationInput): Promise<CampaignInvitation> {
        const result = await this.db
            .prepare(
                `INSERT INTO campaign_invitations (campaign_id, inviter_id, invitee_id)
                 VALUES (?, ?, ?)
                 RETURNING id, campaign_id, inviter_id, invitee_id, status, created_at, updated_at`,
            )
            .bind(input.campaign_id, input.inviter_id, input.invitee_id)
            .first<InvitationRow>();

        if (!result) throw new Error("Failed to create invitation");
        return this.toInvitation(result);
    }

    async findById(id: number): Promise<CampaignInvitation | null> {
        const result = await this.db
            .prepare(
                "SELECT id, campaign_id, inviter_id, invitee_id, status, created_at, updated_at FROM campaign_invitations WHERE id = ? LIMIT 1",
            )
            .bind(id)
            .first<InvitationRow>();
        return result ? this.toInvitation(result) : null;
    }

    async findPendingByInviteeId(inviteeId: number): Promise<CampaignInvitationSummary[]> {
        const { results } = await this.db
            .prepare(
                `SELECT
                    ci.id,
                    ci.status,
                    ci.campaign_id,
                    c.name  AS campaign_name,
                    u.name  AS inviter_name,
                    u.nickname AS inviter_nickname,
                    ci.created_at
                 FROM campaign_invitations ci
                 INNER JOIN campaigns c ON c.id = ci.campaign_id
                 INNER JOIN users     u ON u.id = ci.inviter_id
                 WHERE ci.invitee_id = ? AND ci.status = 'pending'
                 ORDER BY ci.created_at DESC`,
            )
            .bind(inviteeId)
            .all<CampaignInvitationSummary>();
        return results;
    }

    async findByCampaignId(campaignId: number): Promise<CampaignInvitationWithInvitee[]> {
        const { results } = await this.db
            .prepare(
                `SELECT
                    ci.id,
                    ci.campaign_id,
                    ci.invitee_id,
                    u.name     AS invitee_name,
                    u.nickname AS invitee_nickname,
                    ci.status,
                    ci.created_at,
                    ci.updated_at
                 FROM campaign_invitations ci
                 INNER JOIN users u ON u.id = ci.invitee_id
                 WHERE ci.campaign_id = ?
                 ORDER BY ci.created_at DESC`,
            )
            .bind(campaignId)
            .all<CampaignInvitationWithInvitee>();
        return results;
    }

    async findActiveByCampaignAndInvitee(campaignId: number, inviteeId: number): Promise<CampaignInvitation | null> {
        const result = await this.db
            .prepare(
                `SELECT id, campaign_id, inviter_id, invitee_id, status, created_at, updated_at
                 FROM campaign_invitations
                 WHERE campaign_id = ? AND invitee_id = ? AND status = 'pending'
                 LIMIT 1`,
            )
            .bind(campaignId, inviteeId)
            .first<InvitationRow>();
        return result ? this.toInvitation(result) : null;
    }

    async updateStatus(id: number, status: InvitationStatus): Promise<void> {
        await this.db
            .prepare(
                "UPDATE campaign_invitations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            )
            .bind(status, id)
            .run();
    }

    async acceptAndCreateMembership(invitationId: number, campaignId: number, userId: number): Promise<void> {
        await this.db.batch([
            this.db
                .prepare("INSERT INTO campaign_members (campaign_id, user_id, role) VALUES (?, ?, 'player')")
                .bind(campaignId, userId),
            this.db
                .prepare(
                    "UPDATE campaign_invitations SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                )
                .bind(invitationId),
        ]);
    }

    private toInvitation(row: InvitationRow): CampaignInvitation {
        return { ...row, status: row.status as InvitationStatus };
    }
}

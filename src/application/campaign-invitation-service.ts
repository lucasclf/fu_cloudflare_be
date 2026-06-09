import { UserNotFoundError } from "../domain/users/user-errors";
import { MemberAlreadyExistsError } from "../domain/campaigns/campaign-member-errors";
import {
    InvitationAlreadyExistsError,
    InvitationForbiddenError,
    InvitationNotFoundError,
    InvitationNotPendingError,
} from "../domain/campaigns/invitation-errors";
import type {
    CampaignInvitation,
    CampaignInvitationSummary,
    CampaignInvitationWithInvitee,
} from "../domain/campaigns/invitation";
import type { CampaignInvitationRepositoryPort } from "./ports/campaign-invitation-ports";
import type { CampaignMemberRepositoryPort } from "./ports/campaign-member-ports";
import type { UserReaderPort } from "./ports/user-ports";

type InviteeIdentifier =
    | { type: "email"; value: string }
    | { type: "nickname"; value: string };

export class CampaignInvitationService {
    constructor(
        private readonly invitationRepo: CampaignInvitationRepositoryPort,
        private readonly memberRepo: CampaignMemberRepositoryPort,
        private readonly userRepo: UserReaderPort,
    ) {}

    async sendInvitation(
        campaignId: number,
        inviterId: number,
        identifier: InviteeIdentifier,
    ): Promise<CampaignInvitation> {
        const invitee = identifier.type === "email"
            ? await this.userRepo.findByEmail(identifier.value)
            : await this.userRepo.findByNickname(identifier.value);

        if (!invitee) throw new UserNotFoundError(identifier.value);

        const existingMember = await this.memberRepo.findByUserAndCampaign(invitee.id, campaignId);
        if (existingMember) throw new MemberAlreadyExistsError(invitee.id, campaignId);

        const existing = await this.invitationRepo.findActiveByCampaignAndInvitee(campaignId, invitee.id);
        if (existing) throw new InvitationAlreadyExistsError(invitee.id, campaignId);

        return await this.invitationRepo.create({
            campaign_id: campaignId,
            inviter_id: inviterId,
            invitee_id: invitee.id,
        });
    }

    async listCampaignInvitations(campaignId: number): Promise<CampaignInvitationWithInvitee[]> {
        return await this.invitationRepo.findByCampaignId(campaignId);
    }

    async cancelInvitation(invitationId: number, campaignId: number): Promise<void> {
        const invitation = await this.invitationRepo.findById(invitationId);
        if (!invitation || invitation.campaign_id !== campaignId) {
            throw new InvitationNotFoundError(invitationId);
        }
        if (invitation.status !== "pending") throw new InvitationNotPendingError(invitationId);
        await this.invitationRepo.updateStatus(invitationId, "cancelled");
    }

    async listMyInvitations(userId: number): Promise<CampaignInvitationSummary[]> {
        return await this.invitationRepo.findPendingByInviteeId(userId);
    }

    async acceptInvitation(invitationId: number, userId: number): Promise<void> {
        const invitation = await this.invitationRepo.findById(invitationId);
        if (!invitation) throw new InvitationNotFoundError(invitationId);
        if (invitation.invitee_id !== userId) throw new InvitationForbiddenError(invitationId);
        if (invitation.status !== "pending") throw new InvitationNotPendingError(invitationId);
        await this.invitationRepo.acceptAndCreateMembership(
            invitationId,
            invitation.campaign_id,
            userId,
        );
    }

    async declineInvitation(invitationId: number, userId: number): Promise<void> {
        const invitation = await this.invitationRepo.findById(invitationId);
        if (!invitation) throw new InvitationNotFoundError(invitationId);
        if (invitation.invitee_id !== userId) throw new InvitationForbiddenError(invitationId);
        if (invitation.status !== "pending") throw new InvitationNotPendingError(invitationId);
        await this.invitationRepo.updateStatus(invitationId, "declined");
    }
}

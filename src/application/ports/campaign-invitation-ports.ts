import type {
    CampaignInvitation,
    CampaignInvitationSummary,
    CampaignInvitationWithInvitee,
    CreateInvitationInput,
    InvitationStatus,
} from "../../domain/campaigns/invitation";

export interface CampaignInvitationRepositoryPort {
    create(input: CreateInvitationInput): Promise<CampaignInvitation>;
    findById(id: number): Promise<CampaignInvitation | null>;
    findPendingByInviteeId(inviteeId: number): Promise<CampaignInvitationSummary[]>;
    findByCampaignId(campaignId: number): Promise<CampaignInvitationWithInvitee[]>;
    findActiveByCampaignAndInvitee(campaignId: number, inviteeId: number): Promise<CampaignInvitation | null>;
    updateStatus(id: number, status: InvitationStatus): Promise<void>;
    acceptAndCreateMembership(invitationId: number, campaignId: number, userId: number): Promise<void>;
}

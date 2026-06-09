export const INVITATION_STATUSES = ["pending", "accepted", "declined", "cancelled"] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export interface CampaignInvitation {
    id: number;
    campaign_id: number;
    inviter_id: number;
    invitee_id: number;
    status: InvitationStatus;
    created_at: string;
    updated_at: string | null;
}

/** Visão do convidado — inclui nome da campanha e do mestre */
export interface CampaignInvitationSummary {
    id: number;
    status: InvitationStatus;
    campaign_id: number;
    campaign_name: string;
    inviter_name: string;
    inviter_nickname: string;
    created_at: string;
}

/** Visão do master — inclui nome do convidado */
export interface CampaignInvitationWithInvitee {
    id: number;
    campaign_id: number;
    invitee_id: number;
    invitee_name: string;
    invitee_nickname: string;
    status: InvitationStatus;
    created_at: string;
    updated_at: string | null;
}

export interface CreateInvitationInput {
    campaign_id: number;
    inviter_id: number;
    invitee_id: number;
}

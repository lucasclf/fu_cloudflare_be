export const INVITATION_STATUSES = ["pending", "accepted", "declined", "cancelled"] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

// TTL de convites pendentes — não fica armazenado como um status próprio (SQLite
// não permite alterar um CHECK constraint existente sem recriar a tabela); em
// vez disso, expires_at é checado de forma "lazy" em quem lê/age sobre o convite.
export const INVITATION_TTL_DAYS = 7;

export interface CampaignInvitation {
    id: number;
    campaign_id: number;
    inviter_id: number;
    invitee_id: number;
    status: InvitationStatus;
    created_at: string;
    updated_at: string | null;
    expires_at: string | null;
}

export function isInvitationExpired(invitation: Pick<CampaignInvitation, "expires_at">, now: Date = new Date()): boolean {
    if (!invitation.expires_at) return false;
    // SQLite datetime('now')/CURRENT_TIMESTAMP retorna "YYYY-MM-DD HH:MM:SS" em UTC,
    // sem marcador de timezone — sem o "Z", o Date do JS interpretaria como horário local.
    const expiresAtUtc = new Date(`${invitation.expires_at.replace(" ", "T")}Z`);
    return expiresAtUtc.getTime() < now.getTime();
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
    expires_at: string | null;
}

export interface CreateInvitationInput {
    campaign_id: number;
    inviter_id: number;
    invitee_id: number;
}

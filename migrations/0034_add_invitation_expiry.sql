-- Migration number: 0034 2026-06-20T00:00:00.000Z

-- Convites pendentes ficavam "zumbis" para sempre (sem TTL), bloqueando o
-- reenvio enquanto um convite antigo (possivelmente esquecido) seguia pendente.
ALTER TABLE campaign_invitations ADD COLUMN expires_at TEXT;

-- Backfill: convites pendentes já existentes recebem 7 dias a partir da criação,
-- mesma regra aplicada a partir de agora em diante (ver D1CampaignInvitationRepository.create).
UPDATE campaign_invitations
SET expires_at = datetime(created_at, '+7 days')
WHERE status = 'pending';

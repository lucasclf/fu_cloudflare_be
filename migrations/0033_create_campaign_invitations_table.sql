-- Migration number: 0033 2026-06-09T00:00:00.000Z

CREATE TABLE IF NOT EXISTS campaign_invitations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    inviter_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_campaign_invitations_invitee  ON campaign_invitations (invitee_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_invitations_campaign ON campaign_invitations (campaign_id, status);

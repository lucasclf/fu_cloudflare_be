-- Migration number: 0032 2026-05-31T00:00:00.000Z

CREATE TABLE IF NOT EXISTS campaign_pcs (
    campaign_id        INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    pc_id              INTEGER NOT NULL REFERENCES pcs(id) ON DELETE CASCADE,
    visible_to_players INTEGER NOT NULL DEFAULT 1 CHECK (visible_to_players IN (0, 1)),
    created_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (campaign_id, pc_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_pcs_campaign_id ON campaign_pcs (campaign_id);

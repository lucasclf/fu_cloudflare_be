-- Migration number: 0030 2026-05-31T00:00:00.000Z

CREATE TABLE IF NOT EXISTS campaign_members (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN ('master', 'player')),
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT,
    UNIQUE (campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign_id ON campaign_members (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_user_id     ON campaign_members (user_id);

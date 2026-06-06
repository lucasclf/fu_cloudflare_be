-- Migration number: 0029 2026-05-31T00:00:00.000Z

CREATE TABLE IF NOT EXISTS campaigns (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    img_key     TEXT,
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_campaigns_name ON campaigns (name);

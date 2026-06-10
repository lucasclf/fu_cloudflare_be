-- Migration number: 0003 	 2026-04-20T21:26:48.132Z
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL,
    title TEXT,
    summary TEXT NOT NULL,
    notes TEXT,
    played_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,
    UNIQUE (session_number, campaign_id),
    UNIQUE (played_at, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_session_number
ON sessions(session_number);

CREATE INDEX IF NOT EXISTS idx_sessions_played_at
ON sessions(played_at);

CREATE INDEX IF NOT EXISTS idx_sessions_campaign_id
ON sessions(campaign_id);
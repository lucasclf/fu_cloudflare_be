-- Migration number: 0001 	 2026-04-20T21:26:48.132Z
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_number INTEGER NOT NULL UNIQUE,
    title TEXT,
    summary TEXT NOT NULL,
    notes TEXT,
    played_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_session_number
ON sessions(session_number);

CREATE INDEX IF NOT EXISTS idx_sessions_played_at
ON sessions(played_at);
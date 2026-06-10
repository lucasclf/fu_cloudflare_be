-- Migration number: 0007  2026-04-25T11:51:48.132Z

CREATE TABLE IF NOT EXISTS factions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,

    img_key TEXT,

    faction_type TEXT NOT NULL DEFAULT 'other'
        CHECK (faction_type IN (
            'guild',
            'kingdom',
            'order',
            'cult',
            'clan',
            'company',
            'criminal',
            'military',
            'other'
        )),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_factions_faction_type
ON factions (faction_type);
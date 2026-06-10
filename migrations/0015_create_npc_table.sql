-- Migration number: 0015 2026-05-07T11:51:48.132Z

CREATE TABLE IF NOT EXISTS npcs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    tagline TEXT,
    img_key TEXT NOT NULL,

    hp INTEGER NULL,
    mp INTEGER NULL,
    initiative INTEGER NULL,
    defense INTEGER NULL,
    magic_defense INTEGER NULL,
    level INTEGER NULL,

    dexterity_die TEXT NULL CHECK (dexterity_die IS NULL OR dexterity_die IN ('d6', 'd8', 'd10', 'd12')),
    insight_die TEXT NULL CHECK (insight_die IS NULL OR insight_die IN ('d6', 'd8', 'd10', 'd12')),
    might_die TEXT NULL CHECK (might_die IS NULL OR might_die IN ('d6', 'd8', 'd10', 'd12')),
    willpower_die TEXT NULL CHECK (willpower_die IS NULL OR willpower_die IN ('d6', 'd8', 'd10', 'd12')),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
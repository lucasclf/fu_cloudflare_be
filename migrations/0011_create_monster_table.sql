-- Migration number: 0009  2026-05-04T11:51:48.132Z

CREATE TABLE IF NOT EXISTS monsters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,

    monster_type TEXT NOT NULL
        CHECK (monster_type IN (
            'construct',
            'demon',
            'elemental',
            'beast',
            'humanoid',
            'monster',
            'undead',
            'plant'
        )),

    level INTEGER NOT NULL,

    dexterity_die TEXT NOT NULL CHECK (dexterity_die IN ('d6', 'd8', 'd10', 'd12')),
    insight_die TEXT NOT NULL CHECK (insight_die IN ('d6', 'd8', 'd10', 'd12')),
    might_die TEXT NOT NULL CHECK (might_die IN ('d6', 'd8', 'd10', 'd12')),
    willpower_die TEXT NOT NULL CHECK (willpower_die IN ('d6', 'd8', 'd10', 'd12')),

    hp INTEGER NOT NULL,
    mp INTEGER NOT NULL,

    initiative INTEGER NOT NULL,

    defense INTEGER NOT NULL,
    magic_defense INTEGER NOT NULL,

    equipment TEXT,
    img_key TEXT,

    is_villain INTEGER NOT NULL DEFAULT 0 CHECK (is_villain IN (0, 1)),
    ultima_points INTEGER NOT NULL DEFAULT 0 CHECK (ultima_points >= 0),
    strategy TEXT NULL,

    source_page INTEGER,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_monsters_monster_type
ON monsters (monster_type);

CREATE INDEX IF NOT EXISTS idx_monsters_level
ON monsters (level);

CREATE INDEX IF NOT EXISTS idx_monsters_is_villain
ON monsters (is_villain);
-- Migration number: 0018 2026-05-10T11:51:48.132Z

CREATE TABLE IF NOT EXISTS pcs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,
    description TEXT,

    pronouns TEXT,
    tagline TEXT,

    origin TEXT,
    identity TEXT,
    theme TEXT,

    dexterity_die TEXT NOT NULL CHECK (dexterity_die IN ('d6', 'd8', 'd10', 'd12')),
    insight_die TEXT NOT NULL CHECK (insight_die IN ('d6', 'd8', 'd10', 'd12')),
    might_die TEXT NOT NULL CHECK (might_die IN ('d6', 'd8', 'd10', 'd12')),
    willpower_die TEXT NOT NULL CHECK (willpower_die IN ('d6', 'd8', 'd10', 'd12')),

    money INTEGER NOT NULL DEFAULT 0 CHECK (money >= 0),

    img_key TEXT,

    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_pcs_name    ON pcs (name);
CREATE INDEX IF NOT EXISTS idx_pcs_user_id ON pcs (user_id);

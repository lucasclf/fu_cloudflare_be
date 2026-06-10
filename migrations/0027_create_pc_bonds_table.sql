-- Migration number: 0027 2026-05-10T11:51:48.132Z

CREATE TABLE IF NOT EXISTS pc_bonds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    pc_id INTEGER NOT NULL,

    target_type TEXT NOT NULL DEFAULT 'freeform'
        CHECK (target_type IN ('pc', 'npc', 'monster', 'freeform')),

    target_id INTEGER,
    target_name TEXT NULL,

    admiration_axis TEXT
        CHECK (
            admiration_axis IS NULL OR
            admiration_axis IN ('admiration', 'inferiority')
        ),

    loyalty_axis TEXT
        CHECK (
            loyalty_axis IS NULL OR
            loyalty_axis IN ('loyalty', 'mistrust')
        ),

    affection_axis TEXT
        CHECK (
            affection_axis IS NULL OR
            affection_axis IN ('affection', 'hatred')
        ),

    description TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,

    FOREIGN KEY (pc_id)
        REFERENCES pcs(id)
        ON DELETE CASCADE,

    CHECK (
        admiration_axis IS NOT NULL OR
        loyalty_axis IS NOT NULL OR
        affection_axis IS NOT NULL
    ),

    CHECK (
        (
            target_type = 'freeform'
            AND target_id IS NULL
            AND target_name IS NOT NULL
        )
        OR
        (
            target_type IN ('pc', 'npc', 'monster')
            AND target_id IS NOT NULL
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_pc_bonds_pc_id
ON pc_bonds (pc_id);

CREATE INDEX IF NOT EXISTS idx_pc_bonds_target_type
ON pc_bonds (target_type);

CREATE INDEX IF NOT EXISTS idx_pc_bonds_target_name
ON pc_bonds (target_name);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pc_bonds_pc_target_id
ON pc_bonds (pc_id, target_type, target_id)
WHERE target_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_pc_bonds_pc_freeform_target_name
ON pc_bonds (pc_id, target_name)
WHERE target_type = 'freeform';
-- Migration number: 0014 2026-05-07T11:51:48.132Z

CREATE TABLE IF NOT EXISTS npc_special_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    npc_id INTEGER NOT NULL,

    type TEXT NOT NULL CHECK (
        type IN (
            'bonus',
            'attack',
            'penalty',
            'passive',
            'reaction',
            'condition',
            'note'
        )
    ),

    title TEXT NOT NULL,
    description TEXT NOT NULL,

    metadata TEXT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (npc_id) REFERENCES npcs(id) ON DELETE CASCADE,
    
    CONSTRAINT uq_npc_special_rules_npc_title
        UNIQUE (npc_id, title)
);
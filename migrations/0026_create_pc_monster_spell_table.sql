-- Migration number: 0026 2026-05-10T11:51:48.132Z

CREATE TABLE IF NOT EXISTS pc_monster_spells (
    pc_id INTEGER NOT NULL,
    monster_action_id INTEGER NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (pc_id, monster_action_id),

    FOREIGN KEY (pc_id)
        REFERENCES pcs(id)
        ON DELETE CASCADE,

    FOREIGN KEY (monster_action_id)
        REFERENCES monster_actions(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pc_monster_spells_pc_id
ON pc_monster_spells (pc_id);

CREATE INDEX IF NOT EXISTS idx_pc_monster_spells_monster_action_id
ON pc_monster_spells (monster_action_id);
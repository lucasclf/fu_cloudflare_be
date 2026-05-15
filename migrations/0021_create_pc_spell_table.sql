-- Migration number: 0021 2026-05-10T11:51:48.132Z

CREATE TABLE IF NOT EXISTS pc_spells (
    pc_id INTEGER NOT NULL,
    spell_id INTEGER NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (pc_id, spell_id),

    FOREIGN KEY (pc_id)
        REFERENCES pcs(id)
        ON DELETE CASCADE,

    FOREIGN KEY (spell_id)
        REFERENCES job_spells(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pc_spells_pc_id
ON pc_spells (pc_id);

CREATE INDEX IF NOT EXISTS idx_pc_spells_spell_id
ON pc_spells (spell_id);
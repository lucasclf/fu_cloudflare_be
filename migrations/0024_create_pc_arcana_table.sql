-- Migration number: 0024 2026-05-10T11:51:48.132Z

CREATE TABLE IF NOT EXISTS pc_arcanas (
    pc_id INTEGER NOT NULL,
    arcana_id INTEGER NOT NULL,
    description TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (pc_id, arcana_id),

    FOREIGN KEY (pc_id)
        REFERENCES pcs(id)
        ON DELETE CASCADE,

    FOREIGN KEY (arcana_id)
        REFERENCES arcanas(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pc_arcanas_pc_id
ON pc_arcanas (pc_id);

CREATE INDEX IF NOT EXISTS idx_pc_arcanas_arcana_id
ON pc_arcanas (arcana_id);
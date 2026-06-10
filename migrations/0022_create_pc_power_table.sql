-- Migration number: 0020 2026-05-10T11:51:48.132Z

CREATE TABLE IF NOT EXISTS pc_powers (
    pc_id INTEGER NOT NULL,
    power_id INTEGER NOT NULL,

    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,

    PRIMARY KEY (pc_id, power_id),

    FOREIGN KEY (pc_id)
        REFERENCES pcs(id)
        ON DELETE CASCADE,

    FOREIGN KEY (power_id)
        REFERENCES job_powers(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pc_powers_pc_id
ON pc_powers (pc_id);

CREATE INDEX IF NOT EXISTS idx_pc_powers_power_id
ON pc_powers (power_id);
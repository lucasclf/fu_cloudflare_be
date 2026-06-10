-- Migration number: 0019 2026-05-10T11:51:48.132Z

CREATE TABLE IF NOT EXISTS pc_jobs (
    pc_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,

    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 10),

    ignore_mp_bonus INTEGER NOT NULL DEFAULT 0 CHECK (ignore_mp_bonus IN (0, 1)),
    ignore_hp_bonus INTEGER NOT NULL DEFAULT 0 CHECK (ignore_hp_bonus IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,

    PRIMARY KEY (pc_id, job_id),

    FOREIGN KEY (pc_id)
        REFERENCES pcs(id)
        ON DELETE CASCADE,

    FOREIGN KEY (job_id)
        REFERENCES jobs(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pc_jobs_pc_id
ON pc_jobs (pc_id);

CREATE INDEX IF NOT EXISTS idx_pc_jobs_job_id
ON pc_jobs (job_id);
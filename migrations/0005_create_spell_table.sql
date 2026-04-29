-- Migration number: 0004  2026-04-25T11:51:48.132Z

CREATE TABLE IF NOT EXISTS job_spells (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,
    description TEXT NOT NULL,
    job_id INTEGER NOT NULL,

    is_offensive INTEGER NOT NULL DEFAULT 0 CHECK (is_offensive IN (0, 1)),

    cost TEXT NOT NULL,
    target TEXT NOT NULL,
    duration TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,

    CONSTRAINT fk_job_spells_job
        FOREIGN KEY (job_id)
        REFERENCES jobs (id)
        ON DELETE CASCADE,

    CONSTRAINT uq_job_spells_job_name
        UNIQUE (job_id, name)
);

CREATE INDEX IF NOT EXISTS idx_job_spells_job_id
ON job_spells (job_id);
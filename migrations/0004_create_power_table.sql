-- Migration number: 0004 	 2026-04-25T11:51:48.132Z

CREATE TABLE IF NOT EXISTS job_powers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,

    type TEXT NOT NULL CHECK (type IN ('common', 'heroic')),   
    is_global INTEGER NOT NULL DEFAULT 0 CHECK (is_global IN (0, 1)),

    max_level INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS job_power_jobs (
    job_id INTEGER NOT NULL,
    power_id INTEGER NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (job_id, power_id),

    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (power_id) REFERENCES job_powers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_job_power_jobs_job_id
ON job_power_jobs (job_id);

CREATE INDEX IF NOT EXISTS idx_job_power_jobs_power_id
ON job_power_jobs (power_id);
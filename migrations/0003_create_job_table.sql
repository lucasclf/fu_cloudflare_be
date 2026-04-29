-- Migration number: 0003 	 2026-04-24T17:17:48.132Z

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  img_key TEXT,
  hp_bonus INTEGER NOT NULL DEFAULT 0,
  mp_bonus INTEGER NOT NULL DEFAULT 0,
  ip_bonus INTEGER NOT NULL DEFAULT 0,

  allows_martial_armor INTEGER NOT NULL DEFAULT 0 CHECK (allows_martial_armor IN (0, 1)),
  allows_martial_shield INTEGER NOT NULL DEFAULT 0 CHECK (allows_martial_shield IN (0, 1)),
  allows_martial_ranged_weapon INTEGER NOT NULL DEFAULT 0 CHECK (allows_martial_ranged_weapon IN (0, 1)),
  allows_martial_melee_weapon INTEGER NOT NULL DEFAULT 0 CHECK (allows_martial_melee_weapon IN (0, 1)),
  allows_arcane INTEGER NOT NULL DEFAULT 0 CHECK (allows_arcane IN (0, 1)),
  allows_rituals INTEGER NOT NULL DEFAULT 0 CHECK (allows_rituals IN (0, 1)),
  can_start_projects INTEGER NOT NULL DEFAULT 0 CHECK (can_start_projects IN (0, 1)),

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS job_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT uq_job_questions_job_sort UNIQUE (job_id, sort_order)
);

CREATE TABLE IF NOT EXISTS job_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  alias TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT uq_job_aliases_job_alias UNIQUE (job_id, alias)
);

CREATE INDEX IF NOT EXISTS idx_job_questions_job_id
ON job_questions(job_id);

CREATE INDEX IF NOT EXISTS idx_job_questions_job_id_sort_order
ON job_questions(job_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_job_aliases_job_id
ON job_aliases(job_id);

CREATE INDEX IF NOT EXISTS idx_job_aliases_alias
ON job_aliases(alias);





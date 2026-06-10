-- Migration number: 0001 2026-05-31T00:00:00.000Z

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    nickname      TEXT NOT NULL UNIQUE,
    img_key       TEXT,
    password_hash TEXT NOT NULL,
    is_super_user INTEGER NOT NULL DEFAULT 0 CHECK (is_super_user IN (0, 1)),
    created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users (nickname);

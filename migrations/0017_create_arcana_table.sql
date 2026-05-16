-- Migration number: 0017 2026-05-10T11:51:48.132Z

CREATE TABLE IF NOT EXISTS arcanas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    domain TEXT NOT NULL,

    merge_effect TEXT NULL,
    dismiss_effect TEXT NULL,

    special_rule TEXT NULL, 

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);
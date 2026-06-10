-- Migration number: 0011 2026-05-05T11:51:48.132Z

CREATE TABLE IF NOT EXISTS monster_affinities (
    monster_id INTEGER PRIMARY KEY,

    physical TEXT NOT NULL DEFAULT 'normal'
        CHECK (physical IN ('normal', 'vulnerable', 'resistant', 'immune', 'absorbs')),

    air TEXT NOT NULL DEFAULT 'normal'
        CHECK (air IN ('normal', 'vulnerable', 'resistant', 'immune', 'absorbs')),

    bolt TEXT NOT NULL DEFAULT 'normal'
        CHECK (bolt IN ('normal', 'vulnerable', 'resistant', 'immune', 'absorbs')),

    dark TEXT NOT NULL DEFAULT 'normal'
        CHECK (dark IN ('normal', 'vulnerable', 'resistant', 'immune', 'absorbs')),

    earth TEXT NOT NULL DEFAULT 'normal'
        CHECK (earth IN ('normal', 'vulnerable', 'resistant', 'immune', 'absorbs')),

    fire TEXT NOT NULL DEFAULT 'normal'
        CHECK (fire IN ('normal', 'vulnerable', 'resistant', 'immune', 'absorbs')),

    ice TEXT NOT NULL DEFAULT 'normal'
        CHECK (ice IN ('normal', 'vulnerable', 'resistant', 'immune', 'absorbs')),

    light TEXT NOT NULL DEFAULT 'normal'
        CHECK (light IN ('normal', 'vulnerable', 'resistant', 'immune', 'absorbs')),

    poison TEXT NOT NULL DEFAULT 'normal'
        CHECK (poison IN ('normal', 'vulnerable', 'resistant', 'immune', 'absorbs')),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,

    FOREIGN KEY (monster_id)
        REFERENCES monsters(id)
        ON DELETE CASCADE
);

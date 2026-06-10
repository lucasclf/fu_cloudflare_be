-- Migration number: 0010 2026-05-05T11:51:48.132Z

CREATE TABLE IF NOT EXISTS monster_traits (
    monster_id INTEGER NOT NULL,
    trait TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (monster_id, trait),

    FOREIGN KEY (monster_id)
        REFERENCES monsters(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_monster_traits_trait
ON monster_traits (trait);
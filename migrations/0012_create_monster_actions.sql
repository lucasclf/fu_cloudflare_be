-- Migration number: 0011 2026-05-05T11:51:48.132Z

CREATE TABLE IF NOT EXISTS monster_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    monster_id INTEGER NOT NULL,

    action_type TEXT NOT NULL
        CHECK (action_type IN (
            'basic_attack',
            'spell',
            'other_action',
            'special_rule'
        )),

    action_icon TEXT
        CHECK (
            action_icon IS NULL OR action_icon IN (
                'melee',
                'ranged',
                'spell',
                'support',
                'passive'
            )
        ),

    name TEXT NOT NULL,
    description TEXT NOT NULL,

    check_formula TEXT,
    accuracy_bonus INTEGER,

    damage_formula TEXT,

    damage_type TEXT
        CHECK (
            damage_type IS NULL OR damage_type IN (
                'physical',
                'air',
                'bolt',
                'dark',
                'earth',
                'fire',
                'ice',
                'light',
                'poison'
            )
        ),

    cost TEXT,
    target TEXT,
    duration TEXT,

    is_offensive INTEGER NOT NULL DEFAULT 0 CHECK (is_offensive IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,

    FOREIGN KEY (monster_id)
        REFERENCES monsters(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_monster_actions_monster_id
ON monster_actions (monster_id);

CREATE INDEX IF NOT EXISTS idx_monster_actions_action_type
ON monster_actions (action_type);

CREATE INDEX IF NOT EXISTS idx_monster_actions_damage_type
ON monster_actions (damage_type);
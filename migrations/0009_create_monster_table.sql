-- Migration number: 0009  2026-05-04T11:51:48.132Z

CREATE TABLE IF NOT EXISTS monsters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,

    monster_type TEXT NOT NULL
        CHECK (monster_type IN (
            'construct',
            'demon',
            'elemental',
            'beast',
            'humanoid',
            'monster',
            'undead',
            'plant'
        )),

    level INTEGER NOT NULL,

    dexterity_die TEXT NOT NULL CHECK (dexterity_die IN ('d6', 'd8', 'd10', 'd12')),
    insight_die TEXT NOT NULL CHECK (insight_die IN ('d6', 'd8', 'd10', 'd12')),
    might_die TEXT NOT NULL CHECK (might_die IN ('d6', 'd8', 'd10', 'd12')),
    willpower_die TEXT NOT NULL CHECK (willpower_die IN ('d6', 'd8', 'd10', 'd12')),

    hp INTEGER NOT NULL,
    crisis_hp INTEGER NOT NULL,
    mp INTEGER NOT NULL,

    initiative INTEGER NOT NULL,

    defense INTEGER NOT NULL,
    magic_defense INTEGER NOT NULL,

    equipment TEXT,
    img_key TEXT,

    source_page INTEGER,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_monsters_monster_type
ON monsters (monster_type);

CREATE INDEX IF NOT EXISTS idx_monsters_level
ON monsters (level);

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

CREATE TABLE IF NOT EXISTS monster_affinities (
    monster_id INTEGER NOT NULL,

    damage_type TEXT NOT NULL
        CHECK (damage_type IN (
            'physical',
            'air',
            'bolt',
            'dark',
            'earth',
            'fire',
            'ice',
            'light',
            'poison'
        )),

    affinity TEXT NOT NULL
        CHECK (affinity IN (
            'normal',
            'vulnerable',
            'resistant',
            'immune',
            'absorbs'
        )),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (monster_id, damage_type),

    FOREIGN KEY (monster_id)
        REFERENCES monsters(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_monster_affinities_damage_type
ON monster_affinities (damage_type);

CREATE INDEX IF NOT EXISTS idx_monster_affinities_affinity
ON monster_affinities (affinity);

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

    sort_order INTEGER NOT NULL DEFAULT 0,

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
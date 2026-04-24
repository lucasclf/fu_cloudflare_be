-- Migration number: 0002 	 2026-04-21T18:48:48.132Z
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    item_type TEXT NOT NULL CHECK (
        item_type IN ('arma', 'armadura', 'escudo', 'acessorio', 'artefato', 'outros')
    ),
    description TEXT,
    url_key TEXT,
    cost INTEGER,

    weapon_category TEXT CHECK (
        weapon_category IN ('arcana', 'arco', 'luta', 'adaga', 'arma_de_fogo', 'malho', 'pesado', 'lança', 'espada', 'arremesso')
    ),
    accuracy TEXT,
    damage TEXT,
    damage_type TEXT,
    grip TEXT,
    distance TEXT,

    defense TEXT,
    magic_defense TEXT,
    initiative TEXT,

    is_martial INTEGER CHECK (is_martial IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_items_id
ON items(id);

CREATE INDEX IF NOT EXISTS idx_items_item_type
ON items(item_type);

CREATE INDEX IF NOT EXISTS idx_items_name
ON items(name);

CREATE INDEX IF NOT EXISTS idx_items_grip
ON items(grip);

CREATE INDEX IF NOT EXISTS idx_items_damage_type
ON items(damage_type);

CREATE INDEX IF NOT EXISTS idx_items_distance
ON items(distance);

CREATE INDEX IF NOT EXISTS idx_items_weapon_category
ON items(weapon_category);
-- Migration number: 0002 	 2026-04-21T18:48:48.132Z
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (
        item_type IN ('weapon', 'armor', 'shield', 'accessory', 'artifact', 'generic')
    ),
    description TEXT NOT NULL,
    url_img TEXT,
    cost INTEGER,

    weapon_category TEXT,
    accuracy TEXT,
    damage TEXT,

    defense INTEGER,
    magic_defense INTEGER,
    initiative INTEGER,

    is_martial INTEGER CHECK (is_martial IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_items_id
ON items(id);

CREATE INDEX IF NOT EXISTS idx_items_item_type
ON items(item_type);

CREATE INDEX IF NOT EXISTS idx_items_weapon_category
ON items(weapon_category);
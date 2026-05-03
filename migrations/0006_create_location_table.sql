-- Migration number: 0006  2026-04-25T11:51:48.132Z

CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,

    img_key TEXT,

    location_type TEXT NOT NULL DEFAULT 'other'
        CHECK (location_type IN (
            'region',
            'city',
            'village',
            'dungeon',
            'landmark',
            'building',
            'other'
        )),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);


CREATE INDEX IF NOT EXISTS idx_locations_location_type
ON locations (location_type);
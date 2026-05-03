-- Migration number: 0008  2026-04-25T11:51:48.132Z

CREATE TABLE IF NOT EXISTS faction_locations (
    faction_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,

    relation_type TEXT NOT NULL DEFAULT 'presence'
        CHECK (relation_type IN (
            'headquarters',
            'origin',
            'territory',
            'influence',
            'presence',
            'enemy_presence',
            'other'
        )),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (faction_id, location_id, relation_type),

    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_faction_locations_faction_id
ON faction_locations (faction_id);

CREATE INDEX IF NOT EXISTS idx_faction_locations_location_id
ON faction_locations (location_id);
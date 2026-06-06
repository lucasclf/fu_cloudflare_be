-- Migration number: 0031 2026-05-31T00:00:00.000Z

CREATE TABLE IF NOT EXISTS campaign_entities (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id        INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    entity_type        TEXT NOT NULL CHECK (entity_type IN (
                           'session', 'npc', 'monster', 'location',
                           'faction', 'item', 'job', 'spell', 'power', 'arcana'
                       )),
    entity_id          INTEGER NOT NULL,
    visible_to_players INTEGER NOT NULL DEFAULT 1 CHECK (visible_to_players IN (0, 1)),
    created_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (campaign_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_entities_campaign_id  ON campaign_entities (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_entities_type_entity  ON campaign_entities (entity_type, entity_id);

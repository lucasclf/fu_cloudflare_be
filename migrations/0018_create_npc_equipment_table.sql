-- Migration number: 0018 2026-05-07T11:51:48.132Z

CREATE TABLE IF NOT EXISTS npc_equipment (
    npc_id INTEGER NOT NULL,

    main_hand INTEGER,
    off_hand INTEGER,
    armor INTEGER,
    accessory INTEGER,

    PRIMARY KEY (npc_id),

    FOREIGN KEY (npc_id)
        REFERENCES npcs(id)
        ON DELETE CASCADE,

    FOREIGN KEY (main_hand)
        REFERENCES items(id)
        ON DELETE SET NULL,

    FOREIGN KEY (off_hand)
        REFERENCES items(id)
        ON DELETE SET NULL,

    FOREIGN KEY (armor)
        REFERENCES items(id)
        ON DELETE SET NULL,

    FOREIGN KEY (accessory)
        REFERENCES items(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_npc_equipment_main_hand
ON npc_equipment (main_hand);

CREATE INDEX IF NOT EXISTS idx_npc_equipment_off_hand
ON npc_equipment (off_hand);

CREATE INDEX IF NOT EXISTS idx_npc_equipment_armor
ON npc_equipment (armor);

CREATE INDEX IF NOT EXISTS idx_npc_equipment_accessory
ON npc_equipment (accessory);

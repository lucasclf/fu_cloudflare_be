-- Migration number: 0018 2026-05-07T11:51:48.132Z

CREATE TABLE IF NOT EXISTS npc_equipment (
    npc_id INTEGER NOT NULL,

    slot TEXT NOT NULL CHECK (
        slot IN (
            'main_hand',
            'off_hand',
            'armor_slot',
            'accessory_slot'
        )
    ),

    item_id INTEGER NOT NULL,

    PRIMARY KEY (npc_id, slot),

    FOREIGN KEY (npc_id) REFERENCES npcs(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
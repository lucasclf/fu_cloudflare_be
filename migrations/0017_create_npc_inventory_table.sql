-- Migration number: 0015 2026-05-07T11:51:48.132Z

CREATE TABLE IF NOT EXISTS npc_inventory (
    npc_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,

    relation_type TEXT NOT NULL CHECK (
        relation_type IN (
            'inventory',
            'shop_stock'
        )
    ),

    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),

    PRIMARY KEY (npc_id, item_id, relation_type),

    FOREIGN KEY (npc_id) REFERENCES npcs(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
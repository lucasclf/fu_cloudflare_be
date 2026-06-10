-- Migration number: 0026 2026-05-10T11:51:48.132Z

CREATE TABLE IF NOT EXISTS pc_inventories (
    pc_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),

    PRIMARY KEY (pc_id, item_id),

    FOREIGN KEY (pc_id)
        REFERENCES pcs(id)
        ON DELETE CASCADE,

    FOREIGN KEY (item_id)
        REFERENCES items(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pc_inventories_pc_id
ON pc_inventories (pc_id);

CREATE INDEX IF NOT EXISTS idx_pc_inventories_item_id
ON pc_inventories (item_id);
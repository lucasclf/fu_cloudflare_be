-- Migration number: 0025 2026-05-10T11:51:48.132Z

CREATE TABLE IF NOT EXISTS pc_equipments (
    pc_id INTEGER NOT NULL,

    main_hand INTEGER,
    off_hand INTEGER,
    armor INTEGER,
    accessory INTEGER,

    PRIMARY KEY (pc_id),

    FOREIGN KEY (pc_id)
        REFERENCES pcs(id)
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

CREATE INDEX IF NOT EXISTS idx_pc_equipments_main_hand
ON pc_equipments (main_hand);

CREATE INDEX IF NOT EXISTS idx_pc_equipments_off_hand
ON pc_equipments (off_hand);

CREATE INDEX IF NOT EXISTS idx_pc_equipments_armor
ON pc_equipments (armor);

CREATE INDEX IF NOT EXISTS idx_pc_equipments_accessory
ON pc_equipments (accessory);
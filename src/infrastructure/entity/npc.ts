export type NpcEquipmentRelationEntity = {
    npc_id: number;
    item_id: number;
    slot: string;
};

export type NpcInventoryRelationEntity = {
    npc_id: number;
    item_id: number;
    relation_type: string;
    quantity: number;
};

export type NpcEntity = {
    id: number;
    name: string;
    description: string;
    tagline: string | null;
    level: number | null;

    dexterity_die: string | null;
    insight_die: string | null;
    might_die: string | null;
    willpower_die: string | null;

    hp: number | null;
    mp: number | null;
    initiative: number | null;
    defense: number | null;
    magic_defense: number | null;

    img_key: string | null;

    created_at: string;
    updated_at: string | null;
};

export type NpcSummaryEntity = {
    id: number;
    name: string;
    tagline: string | null;
    level: number | null;
    dexterity_die: string | null;
    insight_die: string | null;
    might_die: string | null;
    willpower_die: string | null;
    img_key: string;
};

export type BondTargetSummaryEntity = {
    id: number;
    name: string;
    img_key: string | null;
};

export type NpcSpecialRulesEntity = {
    id: number;
    npc_id: number;
    type: string;
    title: string;
    description: string;
    metadata: string | null;
    created_at: string;
    updated_at: string;
};

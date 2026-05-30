import { D1Boolean } from "../d1-utils";

export type PcArcanaRelationRow = {
    pc_id: number;
    arcana_id: number;
    description: string | null;
};

export type PcBondRow = {
    id: number;
    pc_id: number;
    target_type: string;
    target_id: number | null;
    target_name: string | null;
    admiration_axis: string | null;
    loyalty_axis: string | null;
    affection_axis: string | null;
    description: string | null;
    created_at?: string;
    updated_at?: string | null;
    img_key: string | null;
};

export type PcEquipmentRow = {
    pc_id: number;
    main_hand: number | null;
    off_hand: number | null;
    armor: number | null;
    accessory: number | null;
};

export type PcInventoryRelationRow = {
    pc_id: number;
    item_id: number;
    quantity: number;
};

export type PcJobRelationRow = {
    pc_id: number;
    job_id: number;
    level: number;
    ignore_hp_bonus: D1Boolean;
	ignore_mp_bonus: D1Boolean;
};

export type PcMonsterSpellRelationRow = {
    pc_id: number;
    monster_action_id: number;
};

export type PcPowerRelationRow = {
    pc_id: number;
    power_id: number;
    level: number;
};

export type PcSpellRelationRow = {
    pc_id: number;
    spell_id: number;
};

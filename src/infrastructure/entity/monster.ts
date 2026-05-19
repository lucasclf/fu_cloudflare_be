import { D1Boolean } from "../d1-utils";

export type MonsterActionEntity = {
    id: number;
    monster_id: number;
    action_type: string;
    action_icon: string | null;
    name: string;
    description: string;
    check_formula: string | null;
    accuracy_bonus: number | null;
    damage_formula: string | null;
    damage_type: string | null;
    cost: string | null;
    target: string | null;
    duration: string | null;
    is_offensive: D1Boolean;
    created_at?: string;
    updated_at?: string | null;
};

export type MonsterSpellEntity = {
    id: number;
    name: string;
    description: string;
    is_offensive: D1Boolean;
    cost: string | null;
    target: string | null;
    duration: string | null;
};

export type MonsterEntity = {
    id: number;
    name: string;
    description: string;
    monster_type: string;
    level: number;

    dexterity_die: string;
    insight_die: string;
    might_die: string;
    willpower_die: string;

    hp: number;
    mp: number;
    initiative: number;
    defense: number;
    magic_defense: number;

    equipment: string | null;
    img_key: string | null;
    source_page: number | null;

    is_villain: D1Boolean;
    ultima_points: number;
    strategy: string | null;

    created_at: string;
    updated_at: string | null;
};

export type BondTargetSummaryEntity = {
    id: number;
    name: string;
    img_key: string | null;
};
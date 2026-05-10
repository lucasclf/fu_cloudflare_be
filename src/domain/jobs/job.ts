import { JobSpell } from "../spells/spells";

export type JobInclude = "background" | "powers" | "spells";

export const ALLOWED_POWER_TYPE = ["common", "heroic"] as const;

export interface Job {
	id: number;
	name: string;
	tagline: string;
	description: string;
	img_key: string | null;

	hp_bonus: number;
	mp_bonus: number;
	ip_bonus: number;

	allows_martial_armor: boolean;
	allows_martial_shield: boolean;
	allows_martial_ranged_weapon: boolean;
	allows_martial_melee_weapon: boolean;
	allows_arcane: boolean;
	allows_rituals: boolean;
	allows_monster_spells: boolean;
	can_start_projects: boolean;

	created_at: string;
	updated_at: string | null;
}

export interface ResumeJob {
	id: number;
	name: string;
	tagline: string;
	img_key: string | null;
	allows_martial_armor: boolean;
	allows_martial_shield: boolean;
	allows_martial_ranged_weapon: boolean;
	allows_martial_melee_weapon: boolean;
	allows_arcane: boolean;
	allows_rituals: boolean;
	allows_monster_spells: boolean;
	can_start_projects: boolean;
	hp_bonus: number;
	mp_bonus: number;
	ip_bonus: number;
}

export interface JobQuestion {
	id: number;
	job_id: number;
	question: string;
	sort_order: number;
}

export interface JobAlias {
	id: number;
	job_id: number;
	alias: string;
}

export interface JobPower {
	id: number;
	name: string;
	description: string;
	type: "common" | "heroic";
	max_level: number;
	is_global: boolean;
}

export interface Arcana {
	id: number;
	name: string;
	domain: string;
	merge_effect: string | null;
	dismiss_effect: string | null;
	special_rules: string | null;
}

export interface JobPowerWithJob extends JobPower {
	job_name: string[];
}

export interface JobFull extends Job {
	questions?: JobQuestion[];
	aliases?: JobAlias[];
	powers?: JobPower[];
	spells?: JobSpell[];
	arcanas?: Arcana[];
}

export interface CreateJobInput {
	name: string;
	tagline: string;
	description: string;
	img_key: string | null;

	hp_bonus: number;
	mp_bonus: number;
	ip_bonus: number;

	allows_martial_armor: boolean;
	allows_martial_shield: boolean;
	allows_martial_ranged_weapon: boolean;
	allows_martial_melee_weapon: boolean;
	allows_arcane: boolean;
	allows_rituals: boolean;
	allows_monster_spells: boolean;
	can_start_projects: boolean;
}

export interface CreateJobQuestionInput {
	job_id: number;
	question: string;
	sort_order: number;
}

export interface CreateJobAliasInput {
	job_id: number;
	alias: string;
}

export interface CreateJobPowerInput {
	job_id: number[];
	name: string;
	description: string;
	type: "common" | "heroic";
	max_level: number;
	is_global: boolean;
}

export interface CreateArcanaInput {
	name: string;
	domain: string;
	merge_effect: string | null;
	dismiss_effect: string | null;
	special_rule: string | null;
}
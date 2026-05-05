export type SpellNature = "job" | "monster";

export interface Spell {
	id: number;
	name: string;
    description: string;
    is_offensive: boolean;
    cost: string;
    target: string;
    duration: string;
}

export interface JobSpell extends Spell {
    nature: "job";
    job_id: number;
}

export interface JobSpellWithJob extends JobSpell {
    job_name: string;
}

export interface MonsterSpell extends Spell {
	nature: "monster";
}

export interface CreateJobSpellInput {
	job_id: number;
	name: string;
	description: string;
	is_offensive: boolean;
	cost: string;
	target: string;
	duration: string;
}

export interface CreateMonsterSpellInput {
	name: string;
	description: string;
	is_offensive: boolean;
	cost: string;
	target: string;
	duration: string;
}
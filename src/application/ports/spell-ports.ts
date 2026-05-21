import { MonsterAction } from "../../domain/monsters/monster";
import type {
	CreateJobSpellInput,
	JobSpell,
	JobSpellWithJob,
	MonsterSpell,
} from "../../domain/spells/spells";

export interface JobSpellReaderPort {
	listSpells(): Promise<JobSpellWithJob[]>;
	findByIds(spellIds: number[]): Promise<Map<number, JobSpell>>;
}

export interface JobSpellWriterPort {
	createJobSpell(input: CreateJobSpellInput): Promise<void>;
}

export interface JobSpellRepositoryPort
	extends JobSpellReaderPort,
		JobSpellWriterPort {}

export interface MonsterSpellReaderPort {
	listSpells(): Promise<MonsterSpell[]>;
	findByIds(monsterActionIds: number[]): Promise<Map<number, MonsterAction>>;
}

export interface MonsterSpellRepositoryPort
	extends MonsterSpellReaderPort {}
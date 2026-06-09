import type {
	CreateActionInput,
	CreateAffinityInput,
	CreateMonsterInput,
	CreateMonsterTraitInput,
	Monster,
	MonsterAction,
	MonsterAffinity,
	MonsterSummary,
	MonsterTrait,
} from "../../domain/monsters/monster";
import type { BondTargetSummary } from "../../domain/pc/pc";

/**
 * Monster base
 */

export interface MonsterReaderPort {
	findAll(): Promise<Monster[]>;
	findAllSummary(globalOnly?: boolean): Promise<MonsterSummary[]>;
	findById(monsterId: string): Promise<Monster | null>;

	findBondTargetsByIds(
		monsterIds: number[],
	): Promise<Map<number, BondTargetSummary>>;
}

export interface MonsterWriterPort {
	create(input: CreateMonsterInput): Promise<void>;
}

export interface MonsterRepositoryPort
	extends MonsterReaderPort,
		MonsterWriterPort {}

/**
 * Monster traits
 */

export interface MonsterTraitReaderPort {
	findByMonstersIds(
		monsterIds: number[],
	): Promise<Map<number, MonsterTrait[]>>;
}

export interface MonsterTraitWriterPort {
	create(input: CreateMonsterTraitInput): Promise<void>;
}

export interface MonsterTraitRepositoryPort
	extends MonsterTraitReaderPort,
		MonsterTraitWriterPort {}

/**
 * Monster affinities
 */

export interface MonsterAffinityReaderPort {
	findByMonstersIds(
		monsterIds: number[],
	): Promise<Map<number, MonsterAffinity>>;
}

export interface MonsterAffinityWriterPort {
	create(input: CreateAffinityInput): Promise<void>;
}

export interface MonsterAffinityRepositoryPort
	extends MonsterAffinityReaderPort,
		MonsterAffinityWriterPort {}

/**
 * Monster actions
 */

export interface MonsterActionReaderPort {
	findByMonstersIds(
		monsterIds: number[],
	): Promise<Map<number, MonsterAction[]>>;

	findAll(include: string[]): Promise<MonsterAction[]>;
}

export interface MonsterActionWriterPort {
	create(input: CreateActionInput): Promise<void>;
}

export interface MonsterActionRepositoryPort
	extends MonsterActionReaderPort,
		MonsterActionWriterPort {}
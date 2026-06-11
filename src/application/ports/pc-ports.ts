import type { Item } from "../../domain/items/item";
import type { Arcana, JobPower, ResumeJob } from "../../domain/jobs/job";
import type { MonsterAction } from "../../domain/monsters/monster";
import type {
	BondTargetSummary,
	CreatePcArcanaRelationInput,
	CreatePcEquipmentInput,
	CreatePCInput,
	UpdatePCInput,
	CreatePcInventoryInput,
	CreatePcMonsterSpellRelationInput,
	CreatePcSpellRelationInput,
	PcBase,
	PcBond,
	PcBondInput,
	PcJobRelation,
	PcPowerRelation,
	PcSummary,
} from "../../domain/pc/pc";
import type { MonsterSpell, Spell } from "../../domain/spells/spells";

/**
 * PC base
 */

export interface PcReaderPort {
	findAllSummary(): Promise<PcSummary[]>;
	findById(pcId: string): Promise<PcBase | null>;
	findAccessibleSummary(userId: number): Promise<PcSummary[]>;
	canUserAccessPc(pcId: string, userId: number): Promise<boolean>;
}

export interface PcExistsPort {
	exists(pcId: number): Promise<boolean>;
}

export interface PcWriterPort {
	create(input: CreatePCInput): Promise<number>;
	update(pcId: string, input: UpdatePCInput): Promise<void>;
}

export interface PcBondTargetReaderPort {
	findBondTargetsByIds(
		ids: number[],
	): Promise<Map<number, BondTargetSummary>>;
}

/**
 * PC relation writers
 */

export interface PcJobWriterPort {
	create(input: PcJobRelation): Promise<void>;
	findByPcId(pcId: number): Promise<PcJobRelation[]>;
}

export interface PcPowerWriterPort {
	create(input: PcPowerRelation): Promise<void>;
}

export interface PcSpellWriterPort {
	create(input: CreatePcSpellRelationInput): Promise<void>;
}

export interface PcArcanaWriterPort {
	create(input: CreatePcArcanaRelationInput): Promise<void>;
}

export interface PcEquipmentWriterPort {
	create(input: CreatePcEquipmentInput): Promise<void>;
}

export interface PcInventoryWriterPort {
	create(input: CreatePcInventoryInput): Promise<void>;
}

export interface PcBondWriterPort {
	create(input: PcBondInput): Promise<void>;
}

export interface PcMonsterSpellWriterPort {
	create(input: CreatePcMonsterSpellRelationInput): Promise<void>;
}

/**
 * PC relation readers
 */

export interface PcJobRelationReaderPort {
	findByPcId(pcId: number): Promise<PcJobRelation[]>;
}

export interface PcPowerRelationReaderPort {
	findByPcId(pcId: number): Promise<PcPowerRelation[]>;
}

export interface PcSpellRelationReaderPort {
	findByPcId(pcId: number): Promise<CreatePcSpellRelationInput[]>;
}

export interface PcArcanaRelationReaderPort {
	findByPcId(pcId: number): Promise<CreatePcArcanaRelationInput[]>;
}

export interface PcEquipmentRelationReaderPort {
	findByPcId(pcId: number): Promise<CreatePcEquipmentInput | null>;
}

export interface PcInventoryRelationReaderPort {
	findByPcId(pcId: number): Promise<CreatePcInventoryInput[]>;
}

export interface PcBondRelationReaderPort {
	findByPcId(pcId: number): Promise<PcBond[]>;
}

export interface PcMonsterSpellRelationReaderPort {
	findByPcId(pcId: number): Promise<CreatePcMonsterSpellRelationInput[]>;
}

/**
 * Lookups usados na montagem do PcFull
 */

export interface JobLookupPort {
	findSummaryByIds(jobIds: number[]): Promise<Map<number, ResumeJob>>;
}

export interface JobPowerLookupPort {
	findByIds(powerIds: number[]): Promise<Map<number, JobPower>>;
}

export interface JobSpellLookupPort {
	findByIds(spellIds: number[]): Promise<Map<number, Spell>>;
}

export interface ArcanaLookupPort {
	findByIds(arcanaIds: number[]): Promise<Map<number, Arcana>>;
}

export interface ItemLookupPort {
	findByIds(itemIds: number[]): Promise<Map<number, Item>>;
}

export interface MonsterSpellLookupPort {
	findByIds(
		monsterActionIds: number[],
	): Promise<Map<number, MonsterSpell>>;
}

/**
 * Validações externas
 */

export interface MonsterActionValidationPort {
	isMonsterSpell(actionId: number): Promise<boolean>;
}
import type { Item } from "../../domain/items/item";
import type {
	CreateNpcEquipmentInput,
	CreateNpcInput,
	CreateNpcInventoryInput,
	CreateSpecialRulesInput,
	Npc,
	NpcSummary,
	NpcSpecialRules,
} from "../../domain/npc/npc";
import type { BondTargetSummary } from "../../domain/pc/pc";

/**
 * NPC base
 */

export interface NpcReaderPort {
	findAll(): Promise<Npc[]>;
	findAllSummary(globalOnly?: boolean): Promise<NpcSummary[]>;
	findById(npcId: string): Promise<Npc | null>;

	findBondTargetsByIds(
		npcIds: number[],
	): Promise<Map<number, BondTargetSummary>>;
}

export interface NpcWriterPort {
	create(input: CreateNpcInput): Promise<number>;
	update(id: number, input: CreateNpcInput): Promise<void>;
}

export interface NpcRepositoryPort extends NpcReaderPort, NpcWriterPort {}

/**
 * NPC special rules
 *
 * Leitura retorna o tipo completo vindo do banco.
 * Escrita usa o input de criação.
 */

export interface NpcSpecialRuleReaderPort {
	findByNpcsIds(
		npcIds: number[],
	): Promise<Map<number, NpcSpecialRules[]>>;
}

export interface NpcSpecialRuleWriterPort {
	create(input: CreateSpecialRulesInput): Promise<void>;
	deleteByNpcId(npcId: number): Promise<void>;
}

export interface NpcSpecialRuleRepositoryPort
	extends NpcSpecialRuleReaderPort,
		NpcSpecialRuleWriterPort {}

/**
 * NPC inventory
 *
 * Aqui mantemos a relação crua com item_id,
 * porque o NpcService usa item_id para buscar o item completo.
 */

export interface NpcInventoryReaderPort {
	findByNpcsIds(
		npcIds: number[],
	): Promise<Map<number, CreateNpcInventoryInput[]>>;
}

export interface NpcInventoryWriterPort {
	create(input: CreateNpcInventoryInput): Promise<void>;
	deleteByNpcId(npcId: number): Promise<void>;
}

export interface NpcInventoryRepositoryPort
	extends NpcInventoryReaderPort,
		NpcInventoryWriterPort {}

/**
 * NPC equipment
 *
 * Também mantém relação crua com item_id.
 */

export interface NpcEquipmentReaderPort {
	findByNpcsIds(
		npcIds: number[],
	): Promise<Map<number, CreateNpcEquipmentInput>>;
}

export interface NpcEquipmentWriterPort {
	create(input: CreateNpcEquipmentInput): Promise<void>;
	deleteByNpcId(npcId: number): Promise<void>;
}

export interface NpcEquipmentRepositoryPort
	extends NpcEquipmentReaderPort,
		NpcEquipmentWriterPort {}

/**
 * Lookup de itens usado para enriquecer inventory/equipment.
 */

export interface NpcItemLookupPort {
	findByIds(itemIds: number[]): Promise<Map<number, Item>>;
}
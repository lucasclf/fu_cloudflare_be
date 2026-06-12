import { ConflictAppError, NotFoundAppError } from "../app-error";

export class NpcAlreadyExistsError extends ConflictAppError {
	constructor(npcName: string) {
		super(`Npc ${npcName} already exists`);
		this.name = "NpcAlreadyExistsError";
	}
}

export class SpecialRulesAlreadyExistsError extends ConflictAppError {
	constructor(title: string) {
		super(`Special Rules ${title} already exists`);
		this.name = "SpecialRulesAlreadyExistsError";
	}
}

export class InventoryAlreadyExistsError extends ConflictAppError {
	constructor(npcId: number, itemId: number) {
		super(`Inventory for NPC ${npcId} and ITEM ${itemId} already exists`);
		this.name = "InventoryAlreadyExistsError";
	}
}

export class NpcEquipmentAlreadyExistsError extends ConflictAppError {
	constructor(npcId: number) {
		super(`Equipment for NPC ${npcId} already exists`);
		this.name = "NpcEquipmentAlreadyExistsError";
	}
}

export class NpcNotFoundError extends NotFoundAppError {
	constructor(npcId: string) {
		super(`Npc ${npcId} not found`);
		this.name = "NpcNotFoundError";
	}
}
export class NpcAlreadyExistsError extends Error {
	constructor(npcName: string) {
		super(`Npc ${npcName} already exists`);
		this.name = "NpcAlreadyExistsError";
	}
}

export class SpecialRulesAlreadyExistsError extends Error {
	constructor(title: string) {
		super(`Special Rules ${title} already exists`);
		this.name = "SpecialRulesAlreadyExistsError";
	}
}

export class InventoryAlreadyExistsError extends Error {
	constructor(npcId: number, itemId: number) {
		super(`Inventory for NPC ${npcId} and ITEM ${itemId} already exists`);
		this.name = "SpecialRulesAlreadyExistsError";
	}
}

export class EquipmentAlreadyExistsError extends Error {
	constructor(npcId: number, itemId: number) {
		super(`Equipment for NPC ${npcId} and ITEM ${itemId} already exists`);
		this.name = "SpecialRulesAlreadyExistsError";
	}
}

export class NpcNotFoundError extends Error {
	constructor(npcId: string) {
		super(`Npc ${npcId} not found`);
		this.name = "NpcNotFoundError";
	}
}
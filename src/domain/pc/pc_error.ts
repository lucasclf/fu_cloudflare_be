import { ConflictAppError, NotFoundAppError } from "../app-error";

export class PcAlreadyExistsError extends ConflictAppError {
	constructor(pcName: string) {
		super(`Pc ${pcName} already exists`);
		this.name = "PcAlreadyExistsError";
	}
}

export class PcInventoryAlreadyExistsError extends ConflictAppError {
	constructor(pcId: number, itemId: number) {
		super(`Inventory for PC ${pcId} and ITEM ${itemId} already exists`);
		this.name = "PcInventoryAlreadyExistsError";
	}
}

export class PcEquipmentAlreadyExistsError extends ConflictAppError {
	constructor(pcId: number) {
		super(`Equipment for PC ${pcId} already exists`);
		this.name = "PcEquipmentAlreadyExistsError";
	}
}

export class PcJobRelationAlreadyExistsError extends ConflictAppError {
	constructor(pcId: number, jobId: number) {
		super(`Relation for PC ${pcId} and JOB ${jobId} already exists`);
		this.name = "PcJobRelationAlreadyExistsError";
	}
}

export class PcPowerRelationAlreadyExistsError extends ConflictAppError {
	constructor(pcId: number, powerId: number) {
		super(`Relation for PC ${pcId} and POWER ${powerId} already exists`);
		this.name = "PcPowerRelationAlreadyExistsError";
	}
}

export class PcSpellRelationAlreadyExistsError extends ConflictAppError {
	constructor(pcId: number, spellId: number) {
		super(`Relation for PC ${pcId} and SPELL ${spellId} already exists`);
		this.name = "PcSpellRelationAlreadyExistsError";
	}
}

export class PcMonsterSpellRelationAlreadyExistsError extends ConflictAppError {
	constructor(pcId: number, monsterActionId: number) {
		super(`Relation for PC ${pcId} and MONSTER SPELL ${monsterActionId} already exists`);
		this.name = "PcSpellRelationAlreadyExistsError";
	}
}
export class PcArcanaRelationAlreadyExistsError extends ConflictAppError {
	constructor(pcId: number, arcanaId: number) {
		super(`Relation for PC ${pcId} and ARCANA ${arcanaId} already exists`);
		this.name = "PcArcanaRelationAlreadyExistsError";
	}
}

export class PcBondAlreadyExistsError extends ConflictAppError {
	constructor(pcId: number, targetId: number | null, targetType: string) {
		super(`Relation for PC ${pcId} and ${targetType} ${targetId} already exists`);
		this.name = "PcArcanaRelationAlreadyExistsError";
	}
}

export class PcNotFoundError extends NotFoundAppError {
	constructor(pcId: string) {
		super(`Pc ${pcId} not found`);
		this.name = "PcNotFoundError";
	}
}
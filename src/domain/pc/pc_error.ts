export class PcAlreadyExistsError extends Error {
	constructor(pcName: string) {
		super(`Pc ${pcName} already exists`);
		this.name = "PcAlreadyExistsError";
	}
}

export class PcInventoryAlreadyExistsError extends Error {
	constructor(pcId: number, itemId: number) {
		super(`Inventory for PC ${pcId} and ITEM ${itemId} already exists`);
		this.name = "PcInventoryAlreadyExistsError";
	}
}

export class PcEquipmentAlreadyExistsError extends Error {
	constructor(pcId: number) {
		super(`Equipment for PC ${pcId} already exists`);
		this.name = "PcEquipmentAlreadyExistsError";
	}
}

export class PcJobRelationAlreadyExistsError extends Error {
	constructor(pcId: number, jobId: number) {
		super(`Relation for PC ${pcId} and JOB ${jobId} already exists`);
		this.name = "PcJobRelationAlreadyExistsError";
	}
}

export class PcPowerRelationAlreadyExistsError extends Error {
	constructor(pcId: number, powerId: number) {
		super(`Relation for PC ${pcId} and POWER ${powerId} already exists`);
		this.name = "PcPowerRelationAlreadyExistsError";
	}
}

export class PcSpellRelationAlreadyExistsError extends Error {
	constructor(pcId: number, spellId: number) {
		super(`Relation for PC ${pcId} and SPELL ${spellId} already exists`);
		this.name = "PcSpellRelationAlreadyExistsError";
	}
}

export class PcMonsterSpellRelationAlreadyExistsError extends Error {
	constructor(pcId: number, monsterActionId: number) {
		super(`Relation for PC ${pcId} and MONSTER SPELL ${monsterActionId} already exists`);
		this.name = "PcSpellRelationAlreadyExistsError";
	}
}
export class PcArcanaRelationAlreadyExistsError extends Error {
	constructor(pcId: number, arcanaId: number) {
		super(`Relation for PC ${pcId} and ARCANA ${arcanaId} already exists`);
		this.name = "PcArcanaRelationAlreadyExistsError";
	}
}

export class PcBondAlreadyExistsError extends Error {
	constructor(pcId: number, targetId: number | null, targetType: string) {
		super(`Relation for PC ${pcId} and ${targetType} ${targetId} already exists`);
		this.name = "PcArcanaRelationAlreadyExistsError";
	}
}

export class PcNotFoundError extends Error {
	constructor(pcId: string) {
		super(`Pc ${pcId} not found`);
		this.name = "PcNotFoundError";
	}
}
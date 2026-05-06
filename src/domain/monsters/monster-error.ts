export class MonsterAlreadyExistsError extends Error {
	constructor(monsterName: string) {
		super(`Monster ${monsterName} already exists`);
		this.name = "MonsterAlreadyExistsError";
	}
}

export class MonsterTraitAlreadyExistsError extends Error {
	constructor(trait: string) {
		super(`Trait ${trait} already exists`);
		this.name = "MonsterTraitAlreadyExistsError";
	}
}

export class MonsterAffinityAlreadyExistsError extends Error {
	constructor(monster_id: number) {
		super(`Affinity for monster ${monster_id} already exists`);
		this.name = "MonsterAffinityAlreadyExistsError";
	}
}

export class MonsterActionAlreadyExistsError extends Error {
	constructor(action: string) {
		super(`Action ${action} already exists`);
		this.name = "MonsterActionAlreadyExistsError";
	}
}

export class MonsterNotFoundError extends Error {
	constructor(monsterName: string) {
		super(`Monster ${monsterName} not found`);
		this.name = "MonsterNotFoundError";
	}
}
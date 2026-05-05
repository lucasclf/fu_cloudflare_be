export class MonsterAlreadyExistsError extends Error {
	constructor(monsterName: string) {
		super(`Monster ${monsterName} already exists`);
		this.name = "MonsterAlreadyExistsError";
	}
}

export class MonsterNotFoundError extends Error {
	constructor(monsterName: string) {
		super(`Monster ${monsterName} not found`);
		this.name = "MonsterNotFoundError";
	}
}

export class MonsterTraitAlreadyExistsError extends Error {
	constructor(trait: string) {
		super(`Monster ${trait} already exists`);
		this.name = "MonsterTraitAlreadyExistsError";
	}
}
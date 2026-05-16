import { ConflictAppError, NotFoundAppError } from "../app-error";

export class MonsterAlreadyExistsError extends ConflictAppError {
	constructor(monsterName: string) {
		super(`Monster ${monsterName} already exists`);
		this.name = "MonsterAlreadyExistsError";
	}
}

export class MonsterTraitAlreadyExistsError extends ConflictAppError {
	constructor(trait: string) {
		super(`Trait ${trait} already exists`);
		this.name = "MonsterTraitAlreadyExistsError";
	}
}

export class MonsterAffinityAlreadyExistsError extends ConflictAppError {
	constructor(monster_id: number) {
		super(`Affinity for monster ${monster_id} already exists`);
		this.name = "MonsterAffinityAlreadyExistsError";
	}
}

export class MonsterActionAlreadyExistsError extends ConflictAppError {
	constructor(action: string) {
		super(`Action ${action} already exists`);
		this.name = "MonsterActionAlreadyExistsError";
	}
}

export class MonsterNotFoundError extends NotFoundAppError {
	constructor(monsterName: string) {
		super(`Monster ${monsterName} not found`);
		this.name = "MonsterNotFoundError";
	}
}
import { ConflictAppError, NotFoundAppError } from "../app-error";

export class FactionAlreadyExistsError extends ConflictAppError {
	constructor(factionName: string) {
		super(`Faction ${factionName} already exists`);
		this.name = "FactionAlreadyExistsError";
	}
}

export class FactionNotFoundError extends NotFoundAppError {
	constructor(factionId: string) {
		super(`Faction ${factionId} not found`);
		this.name = "FactionNotFoundError";
	}
}
export class FactionAlreadyExistsError extends Error {
	constructor(factionName: string) {
		super(`Faction ${factionName} already exists`);
		this.name = "FactionAlreadyExistsError";
	}
}

export class FactionNotFoundError extends Error {
	constructor(factionId: string) {
		super(`Faction ${factionId} not found`);
		this.name = "FactionNotFoundError";
	}
}
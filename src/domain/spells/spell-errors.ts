import { ConflictAppError } from "../app-error";

export class SpellAlreadyExistsError extends ConflictAppError {
	constructor(SpellName: string) {
		super(`Spell ${SpellName} already exists`);
		this.name = "SpellAlreadyExistsError";
	}
}
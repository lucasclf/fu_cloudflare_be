export class SpellAlreadyExistsError extends Error {
	constructor(SpellName: string) {
		super(`Spell ${SpellName} already exists`);
		this.name = "SpellAlreadyExistsError";
	}
}
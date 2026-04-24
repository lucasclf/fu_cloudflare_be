export class ItemAlreadyExistsError extends Error {
	constructor(itemNumber: string) {
		super(`Item ${itemNumber} already exists`);
		this.name = "ItemAlreadyExistsError";
	}
}

export class ItemNotFoundError extends Error {
	constructor(itemNumber: string) {
		super(`Item ${itemNumber} not found`);
		this.name = "ItemNotFoundError";
	}
}

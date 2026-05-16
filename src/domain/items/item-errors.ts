import { ConflictAppError, NotFoundAppError } from "../app-error";

export class ItemAlreadyExistsError extends ConflictAppError {
	constructor(itemNumber: string) {
		super(`Item ${itemNumber} already exists`);
		this.name = "ItemAlreadyExistsError";
	}
}

export class ItemNotFoundError extends NotFoundAppError {
	constructor(itemNumber: string) {
		super(`Item ${itemNumber} not found`);
		this.name = "ItemNotFoundError";
	}
}

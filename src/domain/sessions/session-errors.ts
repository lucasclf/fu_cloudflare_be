import { ConflictAppError, NotFoundAppError } from "../app-error";

export class SessionAlreadyExistsError extends ConflictAppError {
	constructor(sessionNumber: number) {
		super(`Session ${sessionNumber} already exists`);
		this.name = "SessionAlreadyExistsError";
	}
}

export class SessionNotFoundError extends NotFoundAppError {
	constructor(sessionNumber: number) {
		super(`Session ${sessionNumber} not found`);
		this.name = "SessionNotFoundError";
	}
}

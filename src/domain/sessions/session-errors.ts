import { ConflictAppError } from "../app-error";

export class SessionAlreadyExistsError extends ConflictAppError {
	constructor(sessionNumber: number) {
		super(`Session ${sessionNumber} already exists`);
		this.name = "SessionAlreadyExistsError";
	}
}

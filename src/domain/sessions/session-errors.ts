export class SessionAlreadyExistsError extends Error {
	constructor(sessionNumber: number) {
		super(`Session ${sessionNumber} already exists`);
		this.name = "SessionAlreadyExistsError";
	}
}

export class SessionNotFoundError extends Error {
	constructor(sessionNumber: number) {
		super(`Session ${sessionNumber} not found`);
		this.name = "SessionNotFoundError";
	}
}

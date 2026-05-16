import { ConflictAppError, NotFoundAppError } from "./app-error";

export class ResourceNotFoundError extends NotFoundAppError {
	constructor(resource: string, identifier?: string | number) {
		const suffix = identifier !== undefined ? `: ${identifier}` : "";
		super(`${resource} not found${suffix}`);
		this.name = "ResourceNotFoundError";
	}
}

export class ResourceAlreadyExistsError extends ConflictAppError {
	constructor(resource: string, identifier?: string | number) {
		const suffix = identifier !== undefined ? `: ${identifier}` : "";
		super(`${resource} already exists${suffix}`);
		this.name = "ResourceAlreadyExistsError";
	}
}
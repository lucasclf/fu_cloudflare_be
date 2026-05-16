import { ConflictAppError, NotFoundAppError } from "../app-error";

export class LocationAlreadyExistsError extends ConflictAppError {
	constructor(locationName: string) {
		super(`Location ${locationName} already exists`);
		this.name = "LocationAlreadyExistsError";
	}
}

export class LocationNotFoundError extends NotFoundAppError {
	constructor(locationId: string) {
		super(`Location ${locationId} not found`);
		this.name = "LocationNotFoundError";
	}
}
export class LocationAlreadyExistsError extends Error {
	constructor(locationName: string) {
		super(`Location ${locationName} already exists`);
		this.name = "LocationAlreadyExistsError";
	}
}

export class LocationNotFoundError extends Error {
	constructor(locationId: string) {
		super(`Location ${locationId} not found`);
		this.name = "LocationNotFoundError";
	}
}
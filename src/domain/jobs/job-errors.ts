export class JobAlreadyExistsError extends Error {
	constructor(jobNumber: string) {
		super(`Job ${jobNumber} already exists`);
		this.name = "JobAlreadyExistsError";
	}
}

export class JobNotFoundError extends Error {
	constructor(jobNumber: string) {
		super(`Job ${jobNumber} not found`);
		this.name = "JobNotFoundError";
	}
}

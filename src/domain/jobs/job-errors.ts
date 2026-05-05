export class JobAlreadyExistsError extends Error {
	constructor(jobNumber: string) {
		super(`Job ${jobNumber} already exists`);
		this.name = "JobAlreadyExistsError";
	}
}

export class JobQuestionAlreadyExistsError extends Error {
	constructor(jobId: number, question: string) {
		super(`Question "${question}" already exists for job ${jobId}`);
		this.name = "JobQuestionAlreadyExistsError";
	}
}

export class JobAliasAlreadyExistsError extends Error {
	constructor(alias: string, jobId: number) {
		super(`Alias "${alias}" already exists for job ${jobId}`);
		this.name = "JobAliasAlreadyExistsError";
	}
}

export class JobPowerAlreadyExistsError extends Error {
	constructor(PowerName: string) {
		super(`Power ${PowerName} already exists`);
		this.name = "JobPowerAlreadyExistsError";
	}
}

export class JobNotFoundError extends Error {
	constructor(jobNumber: string) {
		super(`Job ${jobNumber} not found`);
		this.name = "JobNotFoundError";
	}
}

import { ConflictAppError, NotFoundAppError } from "../app-error";

export class JobAlreadyExistsError extends ConflictAppError {
	constructor(jobNumber: string) {
		super(`Job ${jobNumber} already exists`);
		this.name = "JobAlreadyExistsError";
	}
}

export class JobQuestionAlreadyExistsError extends ConflictAppError {
	constructor(jobId: number, question: string) {
		super(`Question "${question}" already exists for job ${jobId}`);
		this.name = "JobQuestionAlreadyExistsError";
	}
}

export class JobAliasAlreadyExistsError extends ConflictAppError {
	constructor(alias: string, jobId: number) {
		super(`Alias "${alias}" already exists for job ${jobId}`);
		this.name = "JobAliasAlreadyExistsError";
	}
}

export class JobPowerAlreadyExistsError extends ConflictAppError {
	constructor(PowerName: string) {
		super(`Power ${PowerName} already exists`);
		this.name = "JobPowerAlreadyExistsError";
	}
}

export class ArcanaAlreadyExistsError extends ConflictAppError {
	constructor(ArcanaName: string) {
		super(`Arcana ${ArcanaName} already exists`);
		this.name = "ArcanaAlreadyExistsError";
	}
}

export class JobNotFoundError extends NotFoundAppError  {
	constructor(jobNumber: string) {
		super(`Job ${jobNumber} not found`);
		this.name = "JobNotFoundError";
	}
}


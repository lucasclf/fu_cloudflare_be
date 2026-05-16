import { ContentfulStatusCode } from "hono/utils/http-status";

export type AppErrorCode =
	| "BAD_REQUEST"
	| "NOT_FOUND"
	| "CONFLICT"
	| "INTERNAL_ERROR";

export abstract class AppError extends Error {
	constructor(
		message: string,
		public readonly status: ContentfulStatusCode,
		public readonly code: AppErrorCode,
	) {
		super(message);
		this.name = new.target.name;
	}
}

export class BadRequestError extends AppError {
	constructor(message: string) {
		super(message, 400, "BAD_REQUEST");
	}
}

export class NotFoundAppError extends AppError {
	constructor(message: string) {
		super(message, 404, "NOT_FOUND");
	}
}

export class ConflictAppError extends AppError {
	constructor(message: string) {
		super(message, 409, "CONFLICT");
	}
}

export class InternalAppError extends AppError {
	constructor(message = "Internal server error") {
		super(message, 500, "INTERNAL_ERROR");
	}
}
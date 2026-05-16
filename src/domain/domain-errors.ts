import { BadRequestError } from "./app-error";

export class ValidationError extends BadRequestError {
	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
	}
}
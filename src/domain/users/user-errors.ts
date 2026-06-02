import { ConflictAppError, NotFoundAppError } from "../app-error";

export class UserAlreadyExistsError extends ConflictAppError {
    constructor(email: string) {
        super(`User already exists: ${email}`);
        this.name = "UserAlreadyExistsError";
    }
}

export class UserNotFoundError extends NotFoundAppError {
    constructor(identifier: string | number) {
        super(`User not found: ${identifier}`);
        this.name = "UserNotFoundError";
    }
}

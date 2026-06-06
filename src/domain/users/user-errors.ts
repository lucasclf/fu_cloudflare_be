import { ConflictAppError, NotFoundAppError } from "../app-error";

export class UserAlreadyExistsError extends ConflictAppError {
    constructor(email: string) {
        super(`User already exists: ${email}`);
        this.name = "UserAlreadyExistsError";
    }
}

export class NicknameAlreadyTakenError extends ConflictAppError {
    constructor(nickname: string) {
        super(`Nickname already taken: ${nickname}`);
        this.name = "NicknameAlreadyTakenError";
    }
}

export class UserNotFoundError extends NotFoundAppError {
    constructor(identifier: string | number) {
        super(`User not found: ${identifier}`);
        this.name = "UserNotFoundError";
    }
}

import { ConflictAppError, NotFoundAppError } from "../app-error";

export class UserAlreadyExistsError extends ConflictAppError {
    constructor(email: string) {
        super(`E-mail já cadastrado: ${email}`);
        this.name = "UserAlreadyExistsError";
    }
}

export class NicknameAlreadyTakenError extends ConflictAppError {
    constructor(nickname: string) {
        super(`Apelido já cadastrado: ${nickname}`);
        this.name = "NicknameAlreadyTakenError";
    }
}

export class UserNotFoundError extends NotFoundAppError {
    constructor(identifier: string | number) {
        super(`User not found: ${identifier}`);
        this.name = "UserNotFoundError";
    }
}

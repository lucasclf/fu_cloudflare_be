import { ConflictAppError, NotFoundAppError } from "../app-error";

export class MemberAlreadyExistsError extends ConflictAppError {
    constructor(userId: number, campaignId: number) {
        super(`User ${userId} is already a member of campaign ${campaignId}`);
        this.name = "MemberAlreadyExistsError";
    }
}

export class MemberNotFoundError extends NotFoundAppError {
    constructor(userId: number, campaignId: number) {
        super(`User ${userId} is not a member of campaign ${campaignId}`);
        this.name = "MemberNotFoundError";
    }
}

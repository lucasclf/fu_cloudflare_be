import { ConflictAppError, NotFoundAppError } from "../app-error";

export class CampaignAlreadyExistsError extends ConflictAppError {
    constructor(name: string) {
        super(`Campaign already exists: ${name}`);
        this.name = "CampaignAlreadyExistsError";
    }
}

export class CampaignNotFoundError extends NotFoundAppError {
    constructor(identifier: string | number) {
        super(`Campaign not found: ${identifier}`);
        this.name = "CampaignNotFoundError";
    }
}

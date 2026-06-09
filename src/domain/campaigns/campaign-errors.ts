import { AppError, ConflictAppError, NotFoundAppError } from "../app-error";

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

export class CampaignMasterLimitReachedError extends AppError {
    constructor() {
        super("Limite de campanhas como mestre atingido (máximo: 5).", 409, "CAMPAIGN_LIMIT_REACHED");
        this.name = "CampaignMasterLimitReachedError";
    }
}

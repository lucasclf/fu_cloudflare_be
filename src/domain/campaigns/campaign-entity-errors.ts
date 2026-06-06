import { ConflictAppError, NotFoundAppError } from "../app-error";

export class CampaignEntityAlreadyLinkedError extends ConflictAppError {
    constructor(entityType: string, entityId: number, campaignId: number) {
        super(`${entityType} ${entityId} is already linked to campaign ${campaignId}`);
        this.name = "CampaignEntityAlreadyLinkedError";
    }
}

export class CampaignPcAlreadyLinkedError extends ConflictAppError {
    constructor(pcId: number, campaignId: number) {
        super(`PC ${pcId} is already linked to campaign ${campaignId}`);
        this.name = "CampaignPcAlreadyLinkedError";
    }
}

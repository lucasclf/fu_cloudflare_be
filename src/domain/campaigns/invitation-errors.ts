import { BadRequestError, ConflictAppError, ForbiddenAppError, NotFoundAppError } from "../app-error";

export class InvitationNotFoundError extends NotFoundAppError {
    constructor(id: number) {
        super(`Invitation not found: ${id}`);
        this.name = "InvitationNotFoundError";
    }
}

export class InvitationAlreadyExistsError extends ConflictAppError {
    constructor(inviteeId: number, campaignId: number) {
        super(`User ${inviteeId} already has a pending invitation for campaign ${campaignId}`);
        this.name = "InvitationAlreadyExistsError";
    }
}

export class InvitationNotPendingError extends BadRequestError {
    constructor(id: number) {
        super(`Invitation ${id} is not pending`);
        this.name = "InvitationNotPendingError";
    }
}

export class InvitationForbiddenError extends ForbiddenAppError {
    constructor(id: number) {
        super(`Access denied to invitation ${id}`);
        this.name = "InvitationForbiddenError";
    }
}

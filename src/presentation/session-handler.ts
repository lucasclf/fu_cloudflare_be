import {
  SessionAlreadyExistsError,
  SessionNotFoundError,
  ValidationError,
} from "../domain/session-errors";
import { SessionService } from "../application/session-service";
import {
  validateCreateSessionInput,
  validateUpdateSessionInput,
} from "../validation/session-validator";
import {
  badRequest,
  conflict,
  internalServerError,
  json,
  methodNotAllowed,
  notFound,
} from "./http";

export class SessionHandler {
  constructor(private readonly service: SessionService) {}

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (request.method === "GET" && (path === "/" || path === "/sessions")) {
        const sessions = await this.service.listSessions();
        return json(sessions);
      }

      if (request.method === "GET" && path.startsWith("/sessions/")) {
        const sessionNumber = this.extractSessionNumber(path);

        const session = await this.service.getSessionByNumber(sessionNumber);

        if (!session) {
          return notFound("Session not found");
        }

        return json(session);
      }

      if (request.method === "POST" && path === "/sessions") {
        const rawBody = await request.json();
        const input = validateCreateSessionInput(rawBody);

        await this.service.createSession(input);

        return json({ success: true }, 201);
      }

      if (request.method === "PUT" && path.startsWith("/sessions/")) {
        const sessionNumber = this.extractSessionNumber(path);
        const rawBody = await request.json();
        const input = validateUpdateSessionInput(rawBody);

        await this.service.updateSession(sessionNumber, input);

        return json({ success: true });
      }

      if (request.method === "DELETE" && path.startsWith("/sessions/")) {
        const sessionNumber = this.extractSessionNumber(path);

        await this.service.deleteSession(sessionNumber);

        return json({ success: true });
      }

      return methodNotAllowed();
    } catch (error) {
      if (error instanceof ValidationError) {
        return badRequest(error.message);
      }

      if (error instanceof SessionAlreadyExistsError) {
        return conflict(error.message);
      }

      if (error instanceof SessionNotFoundError) {
        return notFound(error.message);
      }

      return internalServerError();
    }
  }

  private extractSessionNumber(path: string): number {
    const rawNumber = path.replace("/sessions/", "");
    const sessionNumber = Number(rawNumber);

    if (!Number.isInteger(sessionNumber) || sessionNumber < 0) {
      throw new ValidationError("Invalid session number");
    }

    return sessionNumber;
  }
}
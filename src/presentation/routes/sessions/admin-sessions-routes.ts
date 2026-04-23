import { Hono } from "hono";
import type { SessionService } from "../../../application/session-service";
import type { Env } from "../../../types/env";
import {
  SessionAlreadyExistsError,
  SessionNotFoundError,
} from "../../../domain/sessions/session-errors";
import {
  ValidationError,
} from "../../../domain/domain-errors";
import {
  validateCreateSessionInput,
  validateUpdateSessionInput,
} from "../../../validation/session-validator";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import {
  badRequest,
  conflict,
  created,
  noContent,
  notFound,
  ok,
} from "../../http";

type SessionServiceFactory = (env: Env) => SessionService;

export function createAdminSessionsRoutes(sessionServiceFactory: SessionServiceFactory) {
  const routes = new Hono<{ Bindings: Env }>();

  routes.use("*", adminAuthMiddleware);

  routes.get("/sessions", async (c) => {
    const service = sessionServiceFactory(c.env);
    const sessions = await service.listSessions();

    return ok(c, sessions);
  });

  routes.get("/sessions/:sessionNumber", async (c) => {
    const sessionNumber = Number(c.req.param("sessionNumber"));

    if (!Number.isInteger(sessionNumber) || sessionNumber < 0) {
      return badRequest(c, "Invalid session number");
    }

    const service = sessionServiceFactory(c.env);
    const session = await service.getSessionByNumber(sessionNumber);

    if (!session) {
      return notFound(c, "Session not found");
    }

    return ok(c, session);
  });

  routes.post("/sessions", async (c) => {
    try {
      const rawBody = await c.req.json();
      const input = validateCreateSessionInput(rawBody);

      const service = sessionServiceFactory(c.env);
      await service.createSession(input);

      return created(c, { message: "Session created successfully" });
    } catch (error) {
      if (error instanceof ValidationError) {
        return badRequest(c, error.message);
      }

      if (error instanceof SessionAlreadyExistsError) {
        return conflict(c, error.message);
      }

      throw error;
    }
  });

  routes.put("/sessions/:sessionNumber", async (c) => {
    const sessionNumber = Number(c.req.param("sessionNumber"));

    if (!Number.isInteger(sessionNumber) || sessionNumber < 0) {
      return badRequest(c, "Invalid session number");
    }

    try {
      const rawBody = await c.req.json();
      const input = validateUpdateSessionInput(rawBody);

      const service = sessionServiceFactory(c.env);
      await service.updateSession(sessionNumber, input);

      return ok(c, { message: "Session updated successfully" });
    } catch (error) {
      if (error instanceof ValidationError) {
        return badRequest(c, error.message);
      }

      if (error instanceof SessionNotFoundError) {
        return notFound(c, error.message);
      }

      throw error;
    }
  });

  routes.delete("/sessions/:sessionNumber", async (c) => {
    const sessionNumber = Number(c.req.param("sessionNumber"));

    if (!Number.isInteger(sessionNumber) || sessionNumber < 0) {
      return badRequest(c, "Invalid session number");
    }

    try {
      const service = sessionServiceFactory(c.env);
      await service.deleteSession(sessionNumber);

      return noContent(c);
    } catch (error) {
      if (error instanceof SessionNotFoundError) {
        return notFound(c, error.message);
      }

      throw error;
    }
  });

  return routes;
}
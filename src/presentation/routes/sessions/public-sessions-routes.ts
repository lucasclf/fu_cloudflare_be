import { Hono } from "hono";
import type { SessionService } from "../../../application/session-service";
import type { Env } from "../../../types/env";
import { badRequest, notFound, ok } from "../../http";

type SessionServiceFactory = (env: Env) => SessionService;

export function createPublicSessionsRoutes(
	sessionServiceFactory: SessionServiceFactory,
) {
	const routes = new Hono<{ Bindings: Env }>();

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

	return routes;
}

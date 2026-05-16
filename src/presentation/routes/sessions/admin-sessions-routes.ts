import { Hono } from "hono";
import type { SessionService } from "../../../application/session-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import {
	validateCreateSessionInput,
	validateUpdateSessionInput,
} from "../../../validation/session-validator";
import {
	badRequest,
	created,
	noContent,
	ok,
} from "../../http";

type SessionServiceFactory = (env: Env) => SessionService;

export function createAdminSessionsRoutes(
	sessionServiceFactory: SessionServiceFactory,
) {
	const routes = new Hono<{ Bindings: Env }>();

	routes.use("*", adminAuthMiddleware);

	routes.post("/sessions", async (c) => {
		const rawBody = await c.req.json();
		const input = validateCreateSessionInput(rawBody);

		const service = sessionServiceFactory(c.env);
		await service.createSession(input);

		return created(c, { message: "Session created successfully" });
	});

	routes.put("/sessions/:sessionNumber", async (c) => {
		const sessionNumber = Number(c.req.param("sessionNumber"));

		if (!Number.isInteger(sessionNumber) || sessionNumber < 0) {
			return badRequest(c, "Invalid session number");
		}

		const rawBody = await c.req.json();
		const input = validateUpdateSessionInput(rawBody);

		const service = sessionServiceFactory(c.env);
		await service.updateSession(sessionNumber, input);

		return ok(c, { message: "Session updated successfully" });
	});

	routes.delete("/sessions/:sessionNumber", async (c) => {
		const sessionNumber = Number(c.req.param("sessionNumber"));

		if (!Number.isInteger(sessionNumber) || sessionNumber < 0) {
			return badRequest(c, "Invalid session number");
		}
		const service = sessionServiceFactory(c.env);
		await service.deleteSession(sessionNumber);

		return noContent(c);
	});

	return routes;
}

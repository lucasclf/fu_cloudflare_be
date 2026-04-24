import type { MiddlewareHandler } from "hono";
import { unauthorized } from "../presentation/http";
import type { Env } from "../types/env";

export const adminAuthMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
	c,
	next,
) => {
	const authHeader = c.req.header("Authorization");

	if (authHeader !== `Bearer ${c.env.API_TOKEN}`) {
		return unauthorized(c);
	}

	await next();
};

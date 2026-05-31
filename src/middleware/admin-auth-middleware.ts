import { timingSafeEqual } from "node:crypto";
import type { MiddlewareHandler } from "hono";
import { unauthorized } from "../presentation/http";
import type { Env } from "../types/env";

export const adminAuthMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
	c,
	next,
) => {
	const encoder = new TextEncoder();
	const expected = encoder.encode(`Bearer ${c.env.API_TOKEN}`);
	const actual = encoder.encode(c.req.header("Authorization") ?? "");

	const isValid =
		expected.length === actual.length && timingSafeEqual(expected, actual);

	if (!isValid) {
		return unauthorized(c);
	}

	await next();
};

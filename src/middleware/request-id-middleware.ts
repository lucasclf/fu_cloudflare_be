import type { MiddlewareHandler } from "hono";
import type { Env, Variables } from "../types/env";

export const requestIdMiddleware: MiddlewareHandler<{
	Bindings: Env;
	Variables: Variables;
}> = async (c, next) => {
	c.set("requestId", crypto.randomUUID());
	await next();
};

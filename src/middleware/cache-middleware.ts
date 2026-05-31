import type { MiddlewareHandler } from "hono";

export const staticCacheMiddleware: MiddlewareHandler = async (c, next) => {
	await next();
	if (c.req.method === "GET" && c.res.ok) {
		c.header("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
	}
};

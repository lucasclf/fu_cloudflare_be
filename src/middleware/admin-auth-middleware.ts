import type { MiddlewareHandler } from "hono";
import type { Env } from "../types/env";
import { unauthorized } from "../presentation/http";

export const adminAuthMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (authHeader !== `Bearer ${c.env.API_TOKEN}`) {
    return unauthorized(c);
  }

  await next();
};
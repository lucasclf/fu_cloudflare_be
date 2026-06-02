import { Hono } from "hono";
import type { UserService } from "../../../application/user-service";
import type { Env } from "../../../types/env";
import { validateLoginInput } from "../../../validation/user-validator";
import { ok, unauthorized } from "../../http";

type UserServiceFactory = (env: Env) => UserService;

export function createAuthRoutes(userServiceFactory: UserServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.post("/login", async (c) => {
        const rawBody = await c.req.json();
        const input = validateLoginInput(rawBody);

        const service = userServiceFactory(c.env);
        const result = await service.login(input);

        if (!result) {
            return unauthorized(c, "Invalid email or password");
        }

        return ok(c, result);
    });

    return routes;
}

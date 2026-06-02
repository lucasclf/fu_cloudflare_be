import { Hono } from "hono";
import type { UserService } from "../../../application/user-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { validateCreateUserInput } from "../../../validation/user-validator";
import { created, noContent, ok } from "../../http";

type UserServiceFactory = (env: Env) => UserService;

export function createAdminUserRoutes(userServiceFactory: UserServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.get("/users", async (c) => {
        const service = userServiceFactory(c.env);
        return ok(c, await service.listUsers());
    });

    routes.post("/users", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateUserInput(rawBody);
        const service = userServiceFactory(c.env);
        await service.createUser(input);
        return created(c, { message: "User created successfully" });
    });

    routes.delete("/users/:id{[0-9]+}", async (c) => {
        const id = c.req.param("id");
        const service = userServiceFactory(c.env);
        await service.deleteUser(id);
        return noContent(c);
    });

    return routes;
}

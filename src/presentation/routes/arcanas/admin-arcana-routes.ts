import { Hono } from "hono";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { validateCreateArcanaInput } from "../../../validation/job-validator";
import { created } from "../../http";
import { ArcanaService } from "../../../application/arcana-service";
import type { Env } from "../../../types/env";


type ArcanaServiceFactory = (env: Env) => ArcanaService;

export function createAdminArcanaRoutes(jobServiceFactory: ArcanaServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);
    routes.post("/arcanas", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateArcanaInput(rawBody);

        const service = jobServiceFactory(c.env);
        await service.createArcana(input);

        return created(c, { message: "Arcana created successfully" });
    });

    return routes;
}
import { Hono } from "hono";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { validateCreateFactionsInput } from "../../../validation/faction-validator";
import { FactionService } from "../../../application/faction-service";
import { created } from "../../http";

type FactionServiceFactory = (env: Env) => FactionService;

export function createAdminFactionsRoutes(factionServiceFactory: FactionServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.post("/factions", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateFactionsInput(rawBody);

        const service = factionServiceFactory(c.env);
        await service.createFaction(input);

        return created(c, { message: "Faction created successfully" });
    });

    return routes;
}
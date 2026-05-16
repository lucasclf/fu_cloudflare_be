import { Hono } from "hono";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { created } from "../../http";

import { SpellService } from "../../../application/spell-service";
import { validateCreateJobSpellsInput } from "../../../validation/spell-validator";

type SpellServiceFactory = (env: Env) => SpellService;

export function createAdminSpellsRoutes(spellServiceFactory: SpellServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.post("/spells", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateJobSpellsInput(rawBody);

        const service = spellServiceFactory(c.env);
        await service.createJobSpell(input);

        return created(c, { message: "Job spell created successfully" });
    });

    return routes;
}


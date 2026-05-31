import { Hono } from "hono";
import { staticCacheMiddleware } from "../../../middleware/cache-middleware";
import type { Env } from "../../../types/env";
import { notFound, ok } from "../../http";
import { SpellService } from "../../../application/spell-service";

type SpellServiceFactory = (env: Env) => SpellService;

export function createPublicSpellsRoutes(spellServiceFactory: SpellServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", staticCacheMiddleware);

    routes.get("/spells", async (c) => {

        const service = spellServiceFactory(c.env);

        const spells = await service.listSpells();
        return ok(c, spells);
    });

    return routes;
}

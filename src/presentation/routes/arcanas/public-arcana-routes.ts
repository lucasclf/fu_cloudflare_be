import { Hono } from "hono";
import type { Env } from "../../../types/env";
import { ok } from "../../http";
import { ArcanaService } from "../../../application/arcana-service";

type ArcanaServiceFactory = (env: Env) => ArcanaService;

export function createPublicArcanaRoutes(spellServiceFactory: ArcanaServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.get("/arcanas", async (c) => {
        const service = spellServiceFactory(c.env);
        const arcanas = await service.listAll();

        return ok (c, arcanas)
    })
    return routes;
}

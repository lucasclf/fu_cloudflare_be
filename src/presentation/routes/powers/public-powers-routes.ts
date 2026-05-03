import { Hono } from "hono";
import type { Env } from "../../../types/env";
import { notFound, ok } from "../../http";
import { PowerService } from "../../../application/power-service";

type PowerServiceFactory = (env: Env) => PowerService;

export function createPublicPowersRoutes(powerServiceFactory: PowerServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.get("/powers", async (c) => {

        const service = powerServiceFactory(c.env);

        const powers = await service.listPowers();
        return ok(c, powers);
    });

    return routes;
}

import { Hono } from "hono";
import { PCService } from "../../../application/pc-service";
import type { Env } from "../../../types/env";
import { notFound, ok } from "../../http";

type PCServiceFactory = (env: Env) => PCService

export function createPublicPcsRoutes(
    pcServiceFactory: PCServiceFactory
) {
    const routes = new Hono<{ Bindings: Env }>();
    
    routes.get("/pcs/summary", async (c) => {
        const service = pcServiceFactory(c.env);
        const pcs = await service.findAllSummary();

        return ok(c, pcs);
    })

    routes.get("/pcs/:id{[0-9]+}", async (c) => {
        const pcId = c.req.param("id");
        const service = pcServiceFactory(c.env);

        const pc = await service.findById(pcId);

        if (!pc) {
            return notFound(c, "PC not found");
        }

        return ok(c, pc);
    })

    return routes;
}
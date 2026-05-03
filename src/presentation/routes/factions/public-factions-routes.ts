import { Hono } from "hono";
import type { Env } from "../../../types/env";
import { badRequest, notFound, ok } from "../../http";
import { FactionService } from "../../../application/faction-service";

type FactionServiceFactory = (env: Env) => FactionService;

export function createPublicFactionsRoutes(
    factionServiceFactory: FactionServiceFactory,
) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.get("/factions", async (c) => {
		const service = factionServiceFactory(c.env);
		const items = await service.listFactions();

		return ok(c, items);
	});

	routes.get("/factions/:factionId", async (c) => {
		const factionId = Number(c.req.param("factionId"));
                
        if (!Number.isInteger(factionId) || factionId < 0) {
            return badRequest(c, "Invalid faction ID");
        }
        
		const service = factionServiceFactory(c.env);
		const item = await service.getFactionById(factionId);

		if (!item) {
			return notFound(c, "Faction not found");
		}

		return ok(c, item);
	});

	return routes;
}
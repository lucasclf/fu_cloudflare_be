import { Hono } from "hono";
import type { Env } from "../../../types/env";
import { LocationService } from "../../../application/location-service";
import { badRequest, notFound, ok } from "../../http";

type LocationServiceFactory = (env: Env) => LocationService;

export function createPublicLocationsRoutes(locationServiceFactory: LocationServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.get("/locations", async (c) => {
        const service = locationServiceFactory(c.env);
        const locations = await service.listLocations();
        
        return ok(c, locations);
    });

    routes.get("/locations/:id", async (c) => {
		const locationId = Number(c.req.param("id"));
        
        if (!Number.isInteger(locationId) || locationId < 0) {
            return badRequest(c, "Invalid location ID");
        }

        const service = locationServiceFactory(c.env);  
        
        const location = await service.getLocationById(locationId);

        if (!location) {
            return notFound(c, "Location not found");
        }
        
        return ok(c, location);
    });

    routes.get("/scenario", async (c) => {
        const service = locationServiceFactory(c.env);
        const worlds = await service.listWorlds();

        return ok(c, worlds);
    });

    return routes;
}
import { Hono } from "hono";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { validateCreateLocationsInput } from "../../../validation/location-validator";
import { LocationService } from "../../../application/location-service";
import type { Env } from "../../../types/env";
import { created } from "../../http";


type LocationServiceFactory = (env: Env) => LocationService;


export function createAdminLocationsRoutes(locationServiceFactory: LocationServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.post("/locations", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateLocationsInput(rawBody);

        const service = locationServiceFactory(c.env);
        await service.createLocation(input);

        return created(c, { message: "Location created successfully" });
    });

    return routes;
}
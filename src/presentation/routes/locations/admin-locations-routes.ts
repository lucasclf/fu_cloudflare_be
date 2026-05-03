import { Hono } from "hono";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { badRequest, conflict, created, notFound } from "../../http";
import { ValidationError } from "../../../domain/domain-errors";
import { validateCreateLocationsInput } from "../../../validation/location-validator";
import { LocationAlreadyExistsError, LocationNotFoundError } from "../../../domain/locations/location-errors";
import { LocationService } from "../../../application/location-service";
import type { Env } from "../../../types/env";


type LocationServiceFactory = (env: Env) => LocationService;


export function createAdminLocationsRoutes(locationServiceFactory: LocationServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.post("/locations", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreateLocationsInput(rawBody);

            const service = locationServiceFactory(c.env);
            await service.createLocation(input);

            return created(c, { message: "Location created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof LocationNotFoundError) {
                return notFound(c, error.message);
            }

            if (error instanceof LocationAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    });

    return routes;
}
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { LocationService } from "../../../application/location-service";
import type { Env } from "../../../types/env";
import { createLocationSchema } from "../../../schemas/location-schemas";
import { badRequestResponse, conflictResponse, createdResponse } from "../../../schemas/common";

type LocationServiceFactory = (env: Env) => LocationService;

export function createAdminLocationsRoutes(locationServiceFactory: LocationServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "post",
            path: "/locations",
            tags: ["Localizações"],
            security: [{ adminToken: [] }],
            summary: "Criar localização",
            request: { body: { content: { "application/json": { schema: createLocationSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = locationServiceFactory(c.env);
            await service.createLocation(input);
            return c.json({ success: true as const, data: { message: "Location created successfully" } } as any, 201);
        },
    );

    return routes;
}

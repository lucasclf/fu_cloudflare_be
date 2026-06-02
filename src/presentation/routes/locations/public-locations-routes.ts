import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { LocationService } from "../../../application/location-service";
import type { Env } from "../../../types/env";
import { locationListResponse, locationResponse } from "../../../schemas/location-schemas";
import { badRequestResponse, notFoundResponse } from "../../../schemas/common";
import { idParamSchema } from "../../../schemas/common";

type LocationServiceFactory = (env: Env) => LocationService;

export function createPublicLocationsRoutes(locationServiceFactory: LocationServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get",
            path: "/locations",
            tags: ["Localizações"],
            summary: "Listar localizações",
            responses: {
                200: { content: { "application/json": { schema: locationListResponse } }, description: "Lista" },
            },
        }),
        async (c) => {
            const service = locationServiceFactory(c.env);
            const locations = await service.listLocations();
            return c.json({ success: true as const, data: locations } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "get",
            path: "/locations/:id",
            tags: ["Localizações"],
            summary: "Buscar localização por ID",
            request: { params: idParamSchema },
            responses: {
                200: { content: { "application/json": { schema: locationResponse } }, description: "Localização" },
                400: badRequestResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const { id } = c.req.valid("param");
            const service = locationServiceFactory(c.env);
            const location = await service.getLocationById(Number(id));
            if (!location) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Location not found" } }, 404) as any;
            return c.json({ success: true as const, data: location } as any, 200);
        },
    );

    return routes;
}

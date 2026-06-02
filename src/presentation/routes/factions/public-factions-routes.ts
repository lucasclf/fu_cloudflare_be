import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { FactionService } from "../../../application/faction-service";
import type { Env } from "../../../types/env";
import { factionListResponse, factionResponse, factionIdParamSchema } from "../../../schemas/faction-schemas";
import { badRequestResponse, notFoundResponse } from "../../../schemas/common";

type FactionServiceFactory = (env: Env) => FactionService;

export function createPublicFactionsRoutes(factionServiceFactory: FactionServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get",
            path: "/factions",
            tags: ["Facções"],
            summary: "Listar facções",
            responses: {
                200: { content: { "application/json": { schema: factionListResponse } }, description: "Lista" },
            },
        }),
        async (c) => {
            const service = factionServiceFactory(c.env);
            const factions = await service.listFactions();
            return c.json({ success: true as const, data: factions } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "get",
            path: "/factions/:factionId",
            tags: ["Facções"],
            summary: "Buscar facção por ID",
            request: { params: factionIdParamSchema },
            responses: {
                200: { content: { "application/json": { schema: factionResponse } }, description: "Facção" },
                400: badRequestResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const { factionId } = c.req.valid("param");
            const service = factionServiceFactory(c.env);
            const faction = await service.getFactionById(Number(factionId));
            if (!faction) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Faction not found" } }, 404) as any;
            return c.json({ success: true as const, data: faction } as any, 200);
        },
    );

    return routes;
}

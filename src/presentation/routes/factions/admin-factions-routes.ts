import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { FactionService } from "../../../application/faction-service";
import type { Env } from "../../../types/env";
import { createFactionSchema } from "../../../schemas/faction-schemas";
import { badRequestResponse, conflictResponse, createdResponse } from "../../../schemas/common";

type FactionServiceFactory = (env: Env) => FactionService;

export function createAdminFactionsRoutes(factionServiceFactory: FactionServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "post",
            path: "/factions",
            tags: ["Facções"],
            security: [{ adminToken: [] }],
            summary: "Criar facção",
            request: { body: { content: { "application/json": { schema: createFactionSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = factionServiceFactory(c.env);
            await service.createFaction(input);
            return c.json({ success: true as const, data: { message: "Faction created successfully" } } as any, 201);
        },
    );

    return routes;
}

import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { ArcanaService } from "../../../application/arcana-service";
import type { Env } from "../../../types/env";
import { createArcanaSchema } from "../../../schemas/arcana-schemas";
import { badRequestResponse, conflictResponse, createdResponse } from "../../../schemas/common";

type ArcanaServiceFactory = (env: Env) => ArcanaService;

export function createAdminArcanaRoutes(arcanaServiceFactory: ArcanaServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "post",
            path: "/arcanas",
            tags: ["Arcanas"],
            security: [{ adminToken: [] }],
            summary: "Criar arcana",
            request: { body: { content: { "application/json": { schema: createArcanaSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = arcanaServiceFactory(c.env);
            await service.createArcana(input);
            return c.json({ success: true as const, data: { message: "Arcana created successfully" } } as any, 201);
        },
    );

    return routes;
}

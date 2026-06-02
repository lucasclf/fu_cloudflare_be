import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ArcanaService } from "../../../application/arcana-service";
import type { Env } from "../../../types/env";
import { arcanaListResponse } from "../../../schemas/arcana-schemas";

type ArcanaServiceFactory = (env: Env) => ArcanaService;

export function createPublicArcanaRoutes(arcanaServiceFactory: ArcanaServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get",
            path: "/arcanas",
            tags: ["Arcanas"],
            summary: "Listar todas as arcanas",
            responses: {
                200: { content: { "application/json": { schema: arcanaListResponse } }, description: "Lista de arcanas" },
            },
        }),
        async (c) => {
            const service = arcanaServiceFactory(c.env);
            const arcanas = await service.listAll();
            return c.json({ success: true as const, data: arcanas } as any, 200);
        },
    );

    return routes;
}

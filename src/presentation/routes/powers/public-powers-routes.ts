import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { PowerService } from "../../../application/power-service";
import type { Env } from "../../../types/env";
import { powerListResponse } from "../../../schemas/power-schemas";
import { scopeQuerySchema } from "../../../schemas/common";

type PowerServiceFactory = (env: Env) => PowerService;

export function createPublicPowersRoutes(powerServiceFactory: PowerServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get",
            path: "/powers",
            tags: ["Poderes"],
            summary: "Listar todos os poderes",
            request: { query: scopeQuerySchema },
            responses: {
                200: { content: { "application/json": { schema: powerListResponse } }, description: "Lista de poderes" },
            },
        }),
        async (c) => {
            const { scope } = c.req.valid("query");
            const service = powerServiceFactory(c.env);
            const powers = await service.listPowers(scope === "global");
            return c.json({ success: true as const, data: powers } as any, 200);
        },
    );

    return routes;
}

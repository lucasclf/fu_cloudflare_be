import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { PCService } from "../../../application/pc-service";
import type { Env } from "../../../types/env";
import { pcSummaryListResponse, pcFullResponse } from "../../../schemas/pc-schemas";
import { idParamSchema, notFoundResponse } from "../../../schemas/common";

type PCServiceFactory = (env: Env) => PCService;

export function createPublicPcsRoutes(pcServiceFactory: PCServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get", path: "/pcs/summary", tags: ["Personagens"], summary: "Listar resumo de PCs",
            responses: { 200: { content: { "application/json": { schema: pcSummaryListResponse } }, description: "Resumos" } },
        }),
        async (c) => {
            return c.json({ success: true as const, data: await pcServiceFactory(c.env).findAllSummary() });
        },
    );

    routes.openapi(
        createRoute({
            method: "get", path: "/pcs/:id", tags: ["Personagens"], summary: "Buscar PC completo por ID",
            description: "Retorna o PC com stats calculados, jobs, poderes, feitiços, equipamento, inventário e vínculos.",
            request: { params: idParamSchema },
            responses: {
                200: { content: { "application/json": { schema: pcFullResponse } }, description: "PC completo" },
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const { id } = c.req.valid("param");
            const pc = await pcServiceFactory(c.env).findById(id);
            if (!pc) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "PC not found" } }, 404) as any;
            return c.json({ success: true as const, data: pc } as any, 200);
        },
    );

    return routes;
}

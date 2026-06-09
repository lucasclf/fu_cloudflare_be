import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { PCService } from "../../../application/pc-service";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { pcSummaryListResponse, pcFullResponse } from "../../../schemas/pc-schemas";
import { idParamSchema, notFoundResponse, unauthorizedResponse } from "../../../schemas/common";

type PCServiceFactory = (env: Env) => PCService;

export function createPublicPcsRoutes(pcServiceFactory: PCServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

    routes.use("*", userAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "get", path: "/pcs/summary", tags: ["Personagens"], summary: "Listar resumo de PCs acessíveis",
            description: "Retorna os PCs do usuário logado e os PCs visíveis via campanha (visible_to_players = true).",
            security: [{ userToken: [] }],
            responses: {
                200: { content: { "application/json": { schema: pcSummaryListResponse } }, description: "Resumos" },
                401: unauthorizedResponse,
            },
        }),
        async (c) => {
            const userId = c.get("userId");
            if (!userId) return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;

            const summaries = await pcServiceFactory(c.env).findAccessibleSummary(userId);
            return c.json({ success: true as const, data: summaries });
        },
    );

    routes.openapi(
        createRoute({
            method: "get", path: "/pcs/:id", tags: ["Personagens"], summary: "Buscar PC completo por ID",
            description: "Retorna o PC com stats calculados, jobs, poderes, feitiços, equipamento, inventário e vínculos. Apenas o dono ou membros de campanha com visible_to_players=true têm acesso.",
            security: [{ userToken: [] }],
            request: { params: idParamSchema },
            responses: {
                200: { content: { "application/json": { schema: pcFullResponse } }, description: "PC completo" },
                401: unauthorizedResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const userId = c.get("userId");
            if (!userId) return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;

            const { id } = c.req.valid("param");
            const service = pcServiceFactory(c.env);

            const hasAccess = await service.canUserAccessPc(id, userId);
            if (!hasAccess) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "PC not found" } }, 404) as any;

            const pc = await service.findById(id);
            if (!pc) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "PC not found" } }, 404) as any;

            return c.json({ success: true as const, data: pc } as any, 200);
        },
    );

    return routes;
}

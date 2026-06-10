import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { UserService } from "../../../application/user-service";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import type { Env, Variables } from "../../../types/env";
import { userSearchQuerySchema, userSearchResponse } from "../../../schemas/campaign-schemas";
import { badRequestResponse, unauthorizedResponse } from "../../../schemas/common";

type UserServiceFactory = (env: Env) => UserService;

export function createUserRoutes(userServiceFactory: UserServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

    routes.use("*", userAuthMiddleware);

    // GET /search?q=...&campaignId=... — buscar usuários para convidar
    routes.openapi(
        createRoute({
            method: "get",
            path: "/search",
            tags: ["Usuários"],
            summary: "Buscar usuários para convite",
            description: "Busca usuários por nickname ou e-mail. Exclui usuários já membros ou com convite pendente na campanha informada.",
            security: [{ userToken: [] }],
            request: { query: userSearchQuerySchema },
            responses: {
                200: { content: { "application/json": { schema: userSearchResponse } }, description: "Resultados" },
                400: badRequestResponse,
                401: unauthorizedResponse,
            },
        }),
        async (c) => {
            const userId = c.get("userId");
            if (!userId) return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;

            const { q, campaignId } = c.req.valid("query");
            const results = await userServiceFactory(c.env).searchUsers(q, Number(campaignId), userId);
            return c.json({ success: true as const, data: results } as any, 200);
        },
    );

    return routes;
}

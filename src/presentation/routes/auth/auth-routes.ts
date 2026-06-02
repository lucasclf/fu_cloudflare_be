import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { UserService } from "../../../application/user-service";
import type { Env } from "../../../types/env";
import { loginSchema, authResultSchema } from "../../../schemas/user-schemas";
import { badRequestResponse, unauthorizedResponse } from "../../../schemas/common";

type UserServiceFactory = (env: Env) => UserService;

export function createAuthRoutes(userServiceFactory: UserServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "post",
            path: "/login",
            tags: ["Autenticação"],
            summary: "Login",
            description: "Retorna um JWT válido por 30 dias. Use o token no header `Authorization: Bearer <token>` nas rotas protegidas.",
            request: { body: { content: { "application/json": { schema: loginSchema } } } },
            responses: {
                200: { content: { "application/json": { schema: authResultSchema } }, description: "Login bem-sucedido" },
                400: badRequestResponse,
                401: unauthorizedResponse,
            },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = userServiceFactory(c.env);
            const result = await service.login(input);
            if (!result) {
                return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Invalid email or password" } }, 401) as any;
            }
            return c.json({ success: true as const, data: result } as any, 200);
        },
    );

    return routes;
}

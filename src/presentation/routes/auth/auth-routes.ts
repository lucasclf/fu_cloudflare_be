import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { setCookie, deleteCookie } from "hono/cookie";
import type { UserService } from "../../../application/user-service";
import type { Env, Variables } from "../../../types/env";
import { loginSchema, authResultSchema, registerUserSchema, meResponse } from "../../../schemas/user-schemas";
import {
    badRequestResponse,
    conflictResponse,
    createdResponse,
    okMessageResponse,
    unauthorizedResponse,
} from "../../../schemas/common";
import { getAuthCookieConfig } from "../../../utils/auth-cookie";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";

type UserServiceFactory = (env: Env) => UserService;

export function createAuthRoutes(userServiceFactory: UserServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

    routes.openapi(
        createRoute({
            method: "post",
            path: "/login",
            tags: ["Autenticação"],
            summary: "Login",
            description:
                "Retorna um JWT válido por 30 dias. Use o token no header `Authorization: Bearer <token>` nas rotas protegidas. " +
                "Se o suporte a cookies estiver habilitado no ambiente (AUTH_COOKIE_ENABLED), o token também é enviado " +
                "via `Set-Cookie` (HttpOnly) como alternativa ao Bearer — os dois modos continuam funcionando em paralelo.",
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
                return c.json(
                    {
                        success: false as const,
                        error: { code: "INVALID_CREDENTIALS", message: "E-mail ou senha inválidos." },
                    },
                    401,
                ) as any;
            }

            const cookieConfig = getAuthCookieConfig(c.env);
            if (cookieConfig.enabled) {
                setCookie(c, cookieConfig.name, result.token, cookieConfig.options);
            }

            return c.json({ success: true as const, data: result } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "post",
            path: "/register",
            tags: ["Autenticação"],
            summary: "Cadastro",
            description:
                "Cria uma conta de usuário comum (sem privilégios administrativos). " +
                "Não realiza login automático nem retorna token — autentique-se em seguida via POST /v1/auth/login. " +
                "Não requer Authorization e nunca aceita is_super_user.",
            request: { body: { content: { "application/json": { schema: registerUserSchema } } } },
            responses: {
                201: createdResponse,
                400: badRequestResponse,
                409: conflictResponse,
            },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = userServiceFactory(c.env);
            await service.register(input);
            return c.json(
                { success: true as const, data: { message: "Cadastro realizado com sucesso." } } as any,
                201,
            );
        },
    );

    routes.use("/me", userAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "get",
            path: "/me",
            tags: ["Autenticação"],
            summary: "Perfil do usuário autenticado",
            description: "Retorna os dados do usuário cujo JWT está no cookie de sessão. Use para restaurar a sessão após refresh de página.",
            security: [{ userToken: [] }],
            responses: {
                200: { content: { "application/json": { schema: meResponse } }, description: "Dados do usuário" },
                401: unauthorizedResponse,
            },
        }),
        async (c) => {
            const user = c.get("currentUser");
            if (!user) return c.json({ success: false as const, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401) as any;
            return c.json({ success: true as const, data: user } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "post",
            path: "/logout",
            tags: ["Autenticação"],
            summary: "Logout",
            description:
                "Remove o cookie de sessão quando o suporte a cookies está habilitado (AUTH_COOKIE_ENABLED). " +
                "Clientes que usam apenas `Authorization: Bearer` não dependem deste endpoint — basta descartar o token localmente, " +
                "já que o JWT é stateless e expira por conta própria.",
            responses: {
                200: okMessageResponse,
            },
        }),
        async (c) => {
            const cookieConfig = getAuthCookieConfig(c.env);
            if (cookieConfig.enabled) {
                deleteCookie(c, cookieConfig.name, cookieConfig.options);
            }
            return c.json(
                { success: true as const, data: { message: "Logout realizado com sucesso." } } as any,
                200,
            );
        },
    );

    return routes;
}

import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { SessionService } from "../../../application/session-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import {
    createSessionSchema,
    updateSessionSchema,
    sessionParamSchema,
} from "../../../schemas/session-schemas";
import {
    badRequestResponse,
    conflictResponse,
    createdResponse,
    noContentResponse,
    notFoundResponse,
    okMessageResponse,
} from "../../../schemas/common";

type SessionServiceFactory = (env: Env) => SessionService;

export function createAdminSessionsRoutes(sessionServiceFactory: SessionServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "post",
            path: "/sessions",
            tags: ["Sessões"],
            security: [{ adminToken: [] }],
            summary: "Criar sessão",
            request: { body: { content: { "application/json": { schema: createSessionSchema } } } },
            responses: {
                201: createdResponse,
                400: badRequestResponse,
                409: conflictResponse,
            },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = sessionServiceFactory(c.env);
            await service.createSession(input);
            return c.json({ success: true as const, data: { message: "Session created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "put",
            path: "/sessions/:sessionNumber",
            tags: ["Sessões"],
            security: [{ adminToken: [] }],
            summary: "Atualizar sessão",
            request: {
                params: sessionParamSchema,
                body: { content: { "application/json": { schema: updateSessionSchema } } },
            },
            responses: {
                200: okMessageResponse,
                400: badRequestResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const { sessionNumber } = c.req.valid("param");
            const input = c.req.valid("json");
            const service = sessionServiceFactory(c.env);
            await service.updateSession(Number(sessionNumber), input);
            return c.json({ success: true as const, data: { message: "Session updated successfully" } } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "delete",
            path: "/sessions/:sessionNumber",
            tags: ["Sessões"],
            security: [{ adminToken: [] }],
            summary: "Remover sessão",
            request: { params: sessionParamSchema },
            responses: {
                204: noContentResponse,
                400: badRequestResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const { sessionNumber } = c.req.valid("param");
            const service = sessionServiceFactory(c.env);
            await service.deleteSession(Number(sessionNumber));
            return c.body(null, 204);
        },
    );

    return routes;
}

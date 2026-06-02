import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import type { SessionService } from "../../../application/session-service";
import type { Env } from "../../../types/env";
import {
    sessionListResponse,
    sessionResponse,
    sessionParamSchema,
} from "../../../schemas/session-schemas";
import { badRequestResponse, notFoundResponse } from "../../../schemas/common";

type SessionServiceFactory = (env: Env) => SessionService;

export function createPublicSessionsRoutes(sessionServiceFactory: SessionServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get",
            path: "/sessions",
            tags: ["Sessões"],
            summary: "Listar sessões",
            responses: {
                200: { content: { "application/json": { schema: sessionListResponse } }, description: "Lista de sessões" },
            },
        }),
        async (c) => {
            const service = sessionServiceFactory(c.env);
            const sessions = await service.listSessions();
            return c.json({ success: true as const, data: sessions } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "get",
            path: "/sessions/:sessionNumber",
            tags: ["Sessões"],
            summary: "Buscar sessão por número",
            request: { params: sessionParamSchema },
            responses: {
                200: { content: { "application/json": { schema: sessionResponse } }, description: "Sessão" },
                400: badRequestResponse,
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const { sessionNumber } = c.req.valid("param");
            const num = Number(sessionNumber);
            const service = sessionServiceFactory(c.env);
            const session = await service.getSessionByNumber(num);
            if (!session) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Session not found" } }, 404) as any;
            return c.json({ success: true as const, data: session } as any, 200);
        },
    );

    return routes;
}

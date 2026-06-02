import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { UserService } from "../../../application/user-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { createUserSchema, userListResponse } from "../../../schemas/user-schemas";
import {
    badRequestResponse,
    conflictResponse,
    createdResponse,
    noContentResponse,
    notFoundResponse,
    idParamSchema,
} from "../../../schemas/common";

type UserServiceFactory = (env: Env) => UserService;

export function createAdminUserRoutes(userServiceFactory: UserServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "get",
            path: "/users",
            tags: ["Usuários"],
            security: [{ adminToken: [] }],
            summary: "Listar usuários",
            responses: { 200: { content: { "application/json": { schema: userListResponse } }, description: "Lista de usuários" } },
        }),
        async (c) => {
            return c.json({ success: true as const, data: await userServiceFactory(c.env).listUsers() });
        },
    );

    routes.openapi(
        createRoute({
            method: "post",
            path: "/users",
            tags: ["Usuários"],
            security: [{ adminToken: [] }],
            summary: "Criar usuário",
            request: { body: { content: { "application/json": { schema: createUserSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse },
        }),
        async (c) => {
            await userServiceFactory(c.env).createUser(c.req.valid("json"));
            return c.json({ success: true as const, data: { message: "User created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "delete",
            path: "/users/:id",
            tags: ["Usuários"],
            security: [{ adminToken: [] }],
            summary: "Remover usuário",
            request: { params: idParamSchema },
            responses: { 204: noContentResponse, 404: notFoundResponse },
        }),
        async (c) => {
            const { id } = c.req.valid("param");
            await userServiceFactory(c.env).deleteUser(id);
            return c.body(null, 204);
        },
    );

    return routes;
}

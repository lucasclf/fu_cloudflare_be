import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { ItemService } from "../../../application/item-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { createItemSchema } from "../../../schemas/item-schemas";
import { badRequestResponse, conflictResponse, createdResponse } from "../../../schemas/common";

type ItemServiceFactory = (env: Env) => ItemService;

export function createAdminItemsRoutes(itemServiceFactory: ItemServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "post",
            path: "/items",
            tags: ["Itens"],
            security: [{ adminToken: [] }],
            summary: "Criar item",
            request: { body: { content: { "application/json": { schema: createItemSchema } } } },
            responses: {
                201: createdResponse,
                400: badRequestResponse,
                409: conflictResponse,
            },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = itemServiceFactory(c.env);
            await service.createItem(input);
            return c.json({ success: true as const, data: { message: "Item created successfully" } } as any, 201);
        },
    );

    return routes;
}

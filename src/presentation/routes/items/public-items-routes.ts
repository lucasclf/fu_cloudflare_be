import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { ItemService } from "../../../application/item-service";
import type { Env } from "../../../types/env";
import { itemListResponse, itemResponse, itemNameParamSchema } from "../../../schemas/item-schemas";
import { notFoundResponse, scopeQuerySchema } from "../../../schemas/common";

type ItemServiceFactory = (env: Env) => ItemService;

export function createPublicItemsRoutes(itemServiceFactory: ItemServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get",
            path: "/items",
            tags: ["Itens"],
            summary: "Listar todos os itens",
            request: { query: scopeQuerySchema },
            responses: {
                200: { content: { "application/json": { schema: itemListResponse } }, description: "Lista de itens" },
            },
        }),
        async (c) => {
            const { scope } = c.req.valid("query");
            const service = itemServiceFactory(c.env);
            const items = await service.listItems(scope === "global");
            return c.json({ success: true as const, data: items } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "get",
            path: "/items/:itemName",
            tags: ["Itens"],
            summary: "Buscar item por nome",
            request: { params: itemNameParamSchema },
            responses: {
                200: { content: { "application/json": { schema: itemResponse } }, description: "Item" },
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const { itemName } = c.req.valid("param");
            const service = itemServiceFactory(c.env);
            const item = await service.getItemByName(itemName);
            if (!item) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Item not found" } }, 404) as any;
            return c.json({ success: true as const, data: item } as any, 200);
        },
    );

    return routes;
}

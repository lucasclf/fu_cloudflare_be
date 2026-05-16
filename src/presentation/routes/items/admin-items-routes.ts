import { Hono } from "hono";
import type { ItemService } from "../../../application/item-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import {
	validateCreateItemInput,
} from "../../../validation/item-validator";
import {
	created,
} from "../../http";

type ItemServiceFactory = (env: Env) => ItemService;

export function createAdminItemsRoutes(itemServiceFactory: ItemServiceFactory) {
	const routes = new Hono<{ Bindings: Env }>();

	routes.use("*", adminAuthMiddleware);

	routes.post("/items", async (c) => {
		const rawBody = await c.req.json();
		const input = validateCreateItemInput(rawBody);

		const service = itemServiceFactory(c.env);
		await service.createItem(input);

		return created(c, { message: "Item created successfully" });
	});

	return routes;
}

import { Hono } from "hono";
import type { Env } from "../../../types/env";
import { NpcService } from "../../../application/npc-service";
import { created } from "../../http";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { validateCreateNpcEquipmentInput, validateCreateNpcInput, validateCreateNpcInventoryInput, validateCreateNpcSpecialRulesInput } from "../../../validation/npc-validator";

type NpcServiceFactory = (env: Env) => NpcService;

export function createAdminNpcRoutes(npcServiceFactory: NpcServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.post("/npcs", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateNpcInput(rawBody);

        const service = npcServiceFactory(c.env);
        await service.createNpc(input);

        return created(c, { message: "Npc created successfully" });
    })

    routes.post("/npcs/special", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateNpcSpecialRulesInput(rawBody);

        const service = npcServiceFactory(c.env);
        await service.createNpcSpecialRules(input);

        return created(c, { message: "Special Rule created successfully" });
    })

    routes.post("/npcs/inventory", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateNpcInventoryInput(rawBody);

        const service = npcServiceFactory(c.env);
        await service.createNpcInventoryRepository(input);

        return created(c, { message: "Inventory created successfully" });
    })

    routes.post("/npcs/equipment", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateNpcEquipmentInput(rawBody);

        const service = npcServiceFactory(c.env);
        await service.createNpcEquipmentRepository(input);

        return created(c, { message: "Equipment created successfully" });
    })

    return routes
}
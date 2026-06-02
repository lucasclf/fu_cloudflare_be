import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { NpcService } from "../../../application/npc-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import {
    createNpcSchema,
    createNpcSpecialRuleSchema,
    createNpcInventorySchema,
    createNpcEquipmentSchema,
} from "../../../schemas/npc-schemas";
import { badRequestResponse, conflictResponse, createdResponse } from "../../../schemas/common";

type NpcServiceFactory = (env: Env) => NpcService;

export function createAdminNpcRoutes(npcServiceFactory: NpcServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "post", path: "/npcs", tags: ["NPCs"],
            security: [{ adminToken: [] }], summary: "Criar NPC",
            request: { body: { content: { "application/json": { schema: createNpcSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse },
        }),
        async (c) => {
            await npcServiceFactory(c.env).createNpc(c.req.valid("json"));
            return c.json({ success: true as const, data: { message: "Npc created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/npcs/special", tags: ["NPCs"],
            security: [{ adminToken: [] }], summary: "Adicionar regra especial",
            request: { body: { content: { "application/json": { schema: createNpcSpecialRuleSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse },
        }),
        async (c) => {
            await npcServiceFactory(c.env).createNpcSpecialRules(c.req.valid("json"));
            return c.json({ success: true as const, data: { message: "Special Rule created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/npcs/inventory", tags: ["NPCs"],
            security: [{ adminToken: [] }], summary: "Adicionar inventário",
            request: { body: { content: { "application/json": { schema: createNpcInventorySchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse },
        }),
        async (c) => {
            await npcServiceFactory(c.env).createNpcInventoryRepository(c.req.valid("json"));
            return c.json({ success: true as const, data: { message: "Inventory created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/npcs/equipment", tags: ["NPCs"],
            security: [{ adminToken: [] }], summary: "Definir equipamento",
            request: { body: { content: { "application/json": { schema: createNpcEquipmentSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse },
        }),
        async (c) => {
            await npcServiceFactory(c.env).createNpcEquipmentRepository(c.req.valid("json"));
            return c.json({ success: true as const, data: { message: "Equipment created successfully" } } as any, 201);
        },
    );

    return routes;
}

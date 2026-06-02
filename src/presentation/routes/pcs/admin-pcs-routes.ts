import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { PCService } from "../../../application/pc-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import {
    createPcSchema, createPcJobRelationSchema, createPcPowerRelationSchema,
    createPcSpellRelationSchema, createPcArcanaRelationSchema, createPcEquipmentSchema,
    createPcInventorySchema, createPcBondSchema, createPcMonsterSpellSchema,
} from "../../../schemas/pc-schemas";
import { badRequestResponse, conflictResponse, createdResponse, notFoundResponse } from "../../../schemas/common";

type PCServiceFactory = (env: Env) => PCService;

export function createAdminPcsRoutes(pcServiceFactory: PCServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({ method: "post", path: "/pcs", tags: ["Personagens"],
            security: [{ adminToken: [] }], summary: "Criar PC", request: { body: { content: { "application/json": { schema: createPcSchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse } }),
        async (c) => { await pcServiceFactory(c.env).createPc(c.req.valid("json")); return c.json({ success: true as const, data: { message: "PC created successfully" } } as any, 201); },
    );
    routes.openapi(
        createRoute({ method: "post", path: "/pcs/jobs", tags: ["Personagens"],
            security: [{ adminToken: [] }], summary: "Vincular profissão ao PC", request: { body: { content: { "application/json": { schema: createPcJobRelationSchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse, 404: notFoundResponse } }),
        async (c) => { await pcServiceFactory(c.env).createPcJobRelation(c.req.valid("json")); return c.json({ success: true as const, data: { message: "PC-Job Relation created successfully" } } as any, 201); },
    );
    routes.openapi(
        createRoute({ method: "post", path: "/pcs/powers", tags: ["Personagens"],
            security: [{ adminToken: [] }], summary: "Vincular poder ao PC", request: { body: { content: { "application/json": { schema: createPcPowerRelationSchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse, 404: notFoundResponse } }),
        async (c) => { await pcServiceFactory(c.env).createPcPowerRelation(c.req.valid("json")); return c.json({ success: true as const, data: { message: "PC-Power Relation created successfully" } } as any, 201); },
    );
    routes.openapi(
        createRoute({ method: "post", path: "/pcs/spells", tags: ["Personagens"],
            security: [{ adminToken: [] }], summary: "Vincular feitiço ao PC", request: { body: { content: { "application/json": { schema: createPcSpellRelationSchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse, 404: notFoundResponse } }),
        async (c) => { await pcServiceFactory(c.env).createPcSpellRelation(c.req.valid("json")); return c.json({ success: true as const, data: { message: "PC-Spell Relation created successfully" } } as any, 201); },
    );
    routes.openapi(
        createRoute({ method: "post", path: "/pcs/arcanas", tags: ["Personagens"],
            security: [{ adminToken: [] }], summary: "Vincular arcana ao PC", request: { body: { content: { "application/json": { schema: createPcArcanaRelationSchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse, 404: notFoundResponse } }),
        async (c) => { await pcServiceFactory(c.env).createPcArcanaRelation(c.req.valid("json")); return c.json({ success: true as const, data: { message: "PC-Arcana Relation created successfully" } } as any, 201); },
    );
    routes.openapi(
        createRoute({ method: "post", path: "/pcs/equipments", tags: ["Personagens"],
            security: [{ adminToken: [] }], summary: "Definir equipamento do PC", request: { body: { content: { "application/json": { schema: createPcEquipmentSchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 404: notFoundResponse } }),
        async (c) => { await pcServiceFactory(c.env).createPcEquipment(c.req.valid("json")); return c.json({ success: true as const, data: { message: "PC-Equipment created successfully" } } as any, 201); },
    );
    routes.openapi(
        createRoute({ method: "post", path: "/pcs/inventories", tags: ["Personagens"],
            security: [{ adminToken: [] }], summary: "Adicionar item ao inventário", request: { body: { content: { "application/json": { schema: createPcInventorySchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 404: notFoundResponse } }),
        async (c) => { await pcServiceFactory(c.env).createPcInventory(c.req.valid("json")); return c.json({ success: true as const, data: { message: "PC-Inventory created successfully" } } as any, 201); },
    );
    routes.openapi(
        createRoute({ method: "post", path: "/pcs/bonds", tags: ["Personagens"],
            security: [{ adminToken: [] }], summary: "Criar vínculo do PC", request: { body: { content: { "application/json": { schema: createPcBondSchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse, 404: notFoundResponse } }),
        async (c) => { await pcServiceFactory(c.env).createPcBond(c.req.valid("json")); return c.json({ success: true as const, data: { message: "PC-Bond created successfully" } } as any, 201); },
    );
    routes.openapi(
        createRoute({ method: "post", path: "/pcs/monster-spells", tags: ["Personagens"],
            security: [{ adminToken: [] }], summary: "Vincular feitiço de monstro ao PC", request: { body: { content: { "application/json": { schema: createPcMonsterSpellSchema } } } }, responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse, 404: notFoundResponse } }),
        async (c) => { await pcServiceFactory(c.env).createPcMonsterSpellRelation(c.req.valid("json")); return c.json({ success: true as const, data: { message: "PC-Monster-Spell Relation created successfully" } } as any, 201); },
    );

    return routes;
}

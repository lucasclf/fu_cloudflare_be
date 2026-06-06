import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { PCService } from "../../../application/pc-service";
import { userAuthMiddleware } from "../../../middleware/user-auth-middleware";
import { pcOwnerMiddleware } from "../../../middleware/pc-owner-middleware";
import type { Env, Variables } from "../../../types/env";
import {
    createPcJobRelationSchema,
    createPcPowerRelationSchema,
    createPcSpellRelationSchema,
    createPcArcanaRelationSchema,
    createPcEquipmentSchema,
    createPcInventorySchema,
    createPcBondSchema,
    createPcMonsterSpellSchema,
} from "../../../schemas/pc-schemas";
import { badRequestResponse, conflictResponse, createdResponse, forbiddenResponse, notFoundResponse } from "../../../schemas/common";

type PCServiceFactory = (env: Env) => PCService;

const pcIdParamSchema = z.object({
    pcId: z.string().regex(/^\d+$/, "pcId must be a positive integer"),
});

const jobBodySchema = createPcJobRelationSchema.omit({ pc_id: true });
const powerBodySchema = createPcPowerRelationSchema.omit({ pc_id: true });
const spellBodySchema = createPcSpellRelationSchema.omit({ pc_id: true });
const arcanaBodySchema = createPcArcanaRelationSchema.omit({ pc_id: true });
const equipmentBodySchema = createPcEquipmentSchema.omit({ pc_id: true });
const inventoryBodySchema = createPcInventorySchema.omit({ pc_id: true });
const bondBodySchema = createPcBondSchema.omit({ pc_id: true });
const monsterSpellBodySchema = createPcMonsterSpellSchema.omit({ pc_id: true });

const sec = [{ userToken: [] }];

export function createPcRelationRoutes(pcServiceFactory: PCServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

    routes.use("*", userAuthMiddleware);
    routes.use("*", pcOwnerMiddleware);

    routes.openapi(
        createRoute({
            method: "post", path: "/:pcId/jobs", tags: ["Personagens"],
            security: sec, summary: "Vincular profissão ao PC",
            request: {
                params: pcIdParamSchema,
                body: { content: { "application/json": { schema: jobBodySchema } } },
            },
            responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse, 409: conflictResponse },
        }),
        async (c) => {
            const { pcId } = c.req.valid("param");
            await pcServiceFactory(c.env).createPcJobRelation({ pc_id: Number(pcId), ...c.req.valid("json") });
            return c.json({ success: true as const, data: { message: "PC-Job Relation created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/:pcId/powers", tags: ["Personagens"],
            security: sec, summary: "Vincular poder ao PC",
            request: {
                params: pcIdParamSchema,
                body: { content: { "application/json": { schema: powerBodySchema } } },
            },
            responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse, 409: conflictResponse },
        }),
        async (c) => {
            const { pcId } = c.req.valid("param");
            await pcServiceFactory(c.env).createPcPowerRelation({ pc_id: Number(pcId), ...c.req.valid("json") });
            return c.json({ success: true as const, data: { message: "PC-Power Relation created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/:pcId/spells", tags: ["Personagens"],
            security: sec, summary: "Vincular feitiço ao PC",
            request: {
                params: pcIdParamSchema,
                body: { content: { "application/json": { schema: spellBodySchema } } },
            },
            responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse, 409: conflictResponse },
        }),
        async (c) => {
            const { pcId } = c.req.valid("param");
            await pcServiceFactory(c.env).createPcSpellRelation({ pc_id: Number(pcId), ...c.req.valid("json") });
            return c.json({ success: true as const, data: { message: "PC-Spell Relation created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/:pcId/arcanas", tags: ["Personagens"],
            security: sec, summary: "Vincular arcana ao PC",
            request: {
                params: pcIdParamSchema,
                body: { content: { "application/json": { schema: arcanaBodySchema } } },
            },
            responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse, 409: conflictResponse },
        }),
        async (c) => {
            const { pcId } = c.req.valid("param");
            await pcServiceFactory(c.env).createPcArcanaRelation({ pc_id: Number(pcId), ...c.req.valid("json") });
            return c.json({ success: true as const, data: { message: "PC-Arcana Relation created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/:pcId/equipments", tags: ["Personagens"],
            security: sec, summary: "Definir equipamento do PC",
            request: {
                params: pcIdParamSchema,
                body: { content: { "application/json": { schema: equipmentBodySchema } } },
            },
            responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse },
        }),
        async (c) => {
            const { pcId } = c.req.valid("param");
            await pcServiceFactory(c.env).createPcEquipment({ pc_id: Number(pcId), ...c.req.valid("json") });
            return c.json({ success: true as const, data: { message: "PC-Equipment created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/:pcId/inventories", tags: ["Personagens"],
            security: sec, summary: "Adicionar item ao inventário",
            request: {
                params: pcIdParamSchema,
                body: { content: { "application/json": { schema: inventoryBodySchema } } },
            },
            responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse },
        }),
        async (c) => {
            const { pcId } = c.req.valid("param");
            await pcServiceFactory(c.env).createPcInventory({ pc_id: Number(pcId), ...c.req.valid("json") });
            return c.json({ success: true as const, data: { message: "PC-Inventory created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/:pcId/bonds", tags: ["Personagens"],
            security: sec, summary: "Criar vínculo do PC",
            request: {
                params: pcIdParamSchema,
                body: { content: { "application/json": { schema: bondBodySchema } } },
            },
            responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse, 409: conflictResponse },
        }),
        async (c) => {
            const { pcId } = c.req.valid("param");
            await pcServiceFactory(c.env).createPcBond({ pc_id: Number(pcId), ...c.req.valid("json") });
            return c.json({ success: true as const, data: { message: "PC-Bond created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/:pcId/monster-spells", tags: ["Personagens"],
            security: sec, summary: "Vincular feitiço de monstro ao PC",
            request: {
                params: pcIdParamSchema,
                body: { content: { "application/json": { schema: monsterSpellBodySchema } } },
            },
            responses: { 201: createdResponse, 400: badRequestResponse, 403: forbiddenResponse, 404: notFoundResponse, 409: conflictResponse },
        }),
        async (c) => {
            const { pcId } = c.req.valid("param");
            await pcServiceFactory(c.env).createPcMonsterSpellRelation({ pc_id: Number(pcId), ...c.req.valid("json") });
            return c.json({ success: true as const, data: { message: "PC-Monster-Spell Relation created successfully" } } as any, 201);
        },
    );

    return routes;
}

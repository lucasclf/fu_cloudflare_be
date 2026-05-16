import { Hono } from "hono";
import { PCService } from "../../../application/pc-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { validateCreatePcArcanaRelationInput, validateCreatePcBondInput, validateCreatePcEquipmentInput, validateCreatePcInput, validateCreatePcInventoryInput, validateCreatePcJobRelationInput, validateCreatePcMonsterSpellRelationInput, validateCreatePcPowerRelationInput, validateCreatePcSpellRelationInput } from "../../../validation/pc-validator";
import type { Env } from "../../../types/env";
import { created } from "../../http";

type PCServiceFactory = (env: Env) => PCService

export function createAdminPcsRoutes (
    pcServiceFactory: PCServiceFactory
) {
    const routes = new Hono<{ Bindings: Env }>();
    
    routes.use("*", adminAuthMiddleware);

    routes.post("/pcs", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreatePcInput(rawBody);

        const service = pcServiceFactory(c.env);
        await service.createPc(input);

        return created(c, { message: "PC created successfully" });
    })

    routes.post("/pcs/jobs", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreatePcJobRelationInput(rawBody);

        const service = pcServiceFactory(c.env);
        await service.createPcJobRelation(input);

        return created(c, { message: "PC-Job Relation created successfully" });
    })

    routes.post("/pcs/powers", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreatePcPowerRelationInput(rawBody);

        const service = pcServiceFactory(c.env);
        await service.createPcPowerRelation(input);

        return created(c, { message: "PC-Power Relation created successfully" });
    })

    routes.post("/pcs/spells", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreatePcSpellRelationInput(rawBody);

        const service = pcServiceFactory(c.env);
        await service.createPcSpellRelation(input);

        return created(c, { message: "PC-Spell Relation created successfully" });
    })

    routes.post("/pcs/arcanas", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreatePcArcanaRelationInput(rawBody);

        const service = pcServiceFactory(c.env);
        await service.createPcArcanaRelation(input);

        return created(c, { message: "PC-Arcana Relation created successfully" });
    })

    routes.post("/pcs/equipments", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreatePcEquipmentInput(rawBody);

        const service = pcServiceFactory(c.env);
        await service.createPcEquipment(input);

        return created(c, { message: "PC-Equipment created successfully" });
    })

    routes.post("/pcs/inventories", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreatePcInventoryInput(rawBody);

        const service = pcServiceFactory(c.env);
        await service.createPcInventory(input);

        return created(c, { message: "PC-Inventory created successfully" });
    })
    
    routes.post("/pcs/bonds", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreatePcBondInput(rawBody);

        const service = pcServiceFactory(c.env);
        await service.createPcBond(input);

        return created(c, { message: "PC-Bond created successfully" });
    })

    routes.post("/pcs/monster-spells", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreatePcMonsterSpellRelationInput(rawBody);

        const service = pcServiceFactory(c.env);
        await service.createPcMonsterSpellRelation(input);

        return created(c, { message: "PC-Monster-Spell Relation created successfully" });
    })

    return routes
}
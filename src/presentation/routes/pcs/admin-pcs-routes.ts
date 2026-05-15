import { Hono } from "hono";
import { PCService } from "../../../application/pc-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { ValidationError } from "../../../domain/domain-errors";
import { PcAlreadyExistsError, PcArcanaRelationAlreadyExistsError, PcBondAlreadyExistsError, PcEquipmentAlreadyExistsError, PcInventoryAlreadyExistsError, PcJobRelationAlreadyExistsError, PcMonsterSpellRelationAlreadyExistsError, PcPowerRelationAlreadyExistsError, PcSpellRelationAlreadyExistsError } from "../../../domain/pc/pc_error";
import { badRequest, conflict, created } from "../../http";
import { validateCreatePcArcanaRelationInput, validateCreatePcBondInput, validateCreatePcEquipmentInput, validateCreatePcInput, validateCreatePcInventoryInput, validateCreatePcJobRelationInput, validateCreatePcMonsterSpellRelationInput, validateCreatePcPowerRelationInput, validateCreatePcSpellRelationInput } from "../../../validation/pc-validator";
import type { Env } from "../../../types/env";

type PCServiceFactory = (env: Env) => PCService

export function createAdminPcsRoutes (
    pcServiceFactory: PCServiceFactory
) {
    const routes = new Hono<{ Bindings: Env }>();
    
    routes.use("*", adminAuthMiddleware);

    routes.post("/pcs", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreatePcInput(rawBody);

            const service = pcServiceFactory(c.env);
            await service.createPc(input);

            return created(c, { message: "PC created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof PcAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/pcs/jobs", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreatePcJobRelationInput(rawBody);

            const service = pcServiceFactory(c.env);
            await service.createPcJobRelation(input);

            return created(c, { message: "PC-Job Relation created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof PcJobRelationAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/pcs/powers", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreatePcPowerRelationInput(rawBody);

            const service = pcServiceFactory(c.env);
            await service.createPcPowerRelation(input);

            return created(c, { message: "PC-Power Relation created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof PcPowerRelationAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/pcs/spells", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreatePcSpellRelationInput(rawBody);

            const service = pcServiceFactory(c.env);
            await service.createPcSpellRelation(input);

            return created(c, { message: "PC-Spell Relation created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof PcSpellRelationAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/pcs/arcanas", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreatePcArcanaRelationInput(rawBody);

            const service = pcServiceFactory(c.env);
            await service.createPcArcanaRelation(input);

            return created(c, { message: "PC-Arcana Relation created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof PcArcanaRelationAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/pcs/equipments", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreatePcEquipmentInput(rawBody);

            const service = pcServiceFactory(c.env);
            await service.createPcEquipment(input);

            return created(c, { message: "PC-Equipment created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof PcEquipmentAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/pcs/inventories", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreatePcInventoryInput(rawBody);

            const service = pcServiceFactory(c.env);
            await service.createPcInventory(input);

            return created(c, { message: "PC-Inventory created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof PcInventoryAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })
    
    routes.post("/pcs/bonds", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreatePcBondInput(rawBody);

            const service = pcServiceFactory(c.env);
            await service.createPcBond(input);

            return created(c, { message: "PC-Bond created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof PcBondAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/pcs/monster-spells", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreatePcMonsterSpellRelationInput(rawBody);

            const service = pcServiceFactory(c.env);
            await service.createPcMonsterSpellRelation(input);

            return created(c, { message: "PC-Monster-Spell Relation created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof PcMonsterSpellRelationAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    return routes
}
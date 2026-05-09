import { Hono } from "hono";
import type { Env } from "../../../types/env";
import { NpcService } from "../../../application/npc-service";
import { badRequest, conflict, created, notFound } from "../../http";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { ValidationError } from "../../../domain/domain-errors";
import { EquipmentAlreadyExistsError, InventoryAlreadyExistsError, NpcAlreadyExistsError, NpcNotFoundError, SpecialRulesAlreadyExistsError } from "../../../domain/npc/npc_error";
import { validateCreateNpcEquipmentInput, validateCreateNpcInput, validateCreateNpcInventoryInput, validateCreateNpcSpecialRulesInput } from "../../../validation/npc-validator";

type NpcServiceFactory = (env: Env) => NpcService;

export function createAdminNpcRoutes(npcServiceFactory: NpcServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.post("/npcs", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreateNpcInput(rawBody);

            const service = npcServiceFactory(c.env);
            await service.createNpc(input);

            return created(c, { message: "Npc created successfully" });
        }
        catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof NpcNotFoundError) {
                return notFound(c, error.message);
            }

            if (error instanceof NpcAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/npcs/special", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreateNpcSpecialRulesInput(rawBody);

            const service = npcServiceFactory(c.env);
            await service.createNpcSpecialRules(input);

            return created(c, { message: "Special Rule created successfully" });
        }
        catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof NpcNotFoundError) {
                return notFound(c, error.message);
            }

            if (error instanceof SpecialRulesAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/npcs/inventory", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreateNpcInventoryInput(rawBody);

            const service = npcServiceFactory(c.env);
            await service.createNpcInventoryRepository(input);

            return created(c, { message: "Inventory created successfully" });
        }
        catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof NpcNotFoundError) {
                return notFound(c, error.message);
            }

            if (error instanceof InventoryAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/npcs/equipment", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreateNpcEquipmentInput(rawBody);

            const service = npcServiceFactory(c.env);
            await service.createNpcEquipmentRepository(input);

            return created(c, { message: "Equipment created successfully" });
        }
        catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof NpcNotFoundError) {
                return notFound(c, error.message);
            }

            if (error instanceof EquipmentAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    return routes
}
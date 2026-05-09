import { Hono } from "hono";
import type { Env } from "../../../types/env";
import { NpcService } from "../../../application/npc-service";
import { badRequest, conflict, created, notFound, ok } from "../../http";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { ValidationError } from "../../../domain/domain-errors";
import { NpcAlreadyExistsError, NpcNotFoundError } from "../../../domain/npc/npc_error";
import { validateCreateNpcEquipmentInput, validateCreateNpcInput, validateCreateNpcInventoryInput, validateCreateNpcSpecialRulesInput } from "../../../validation/npc-validator";
import { NpcInclude } from "../../../domain/npc/npc";

type NpcServiceFactory = (env: Env) => NpcService;

const allowedIncludes: NpcInclude[] = [ "rules", "inventories", "equipments"];

function parseJobIncludes(include?: string): NpcInclude[] {
    if (!include) {
        return [];
    }

    return include
        .split(",")
        .map((value) => value.trim())
        .filter((value): value is NpcInclude =>
            allowedIncludes.includes(value as NpcInclude),
        );
}

export function createPublicNpcRoutes(npcServiceFactory: NpcServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.get("/npcs", async (c) => {
        const service = await npcServiceFactory(c.env);
        const npcs = service.findAll();

        return ok(c, npcs);
    })

    routes.get("/npcs/summary", async (c) => {
        const service = npcServiceFactory(c.env);
        const npcs = await service.findAllSummary();

        return ok(c, npcs);
    })

    routes.get("/npcs/:id", async (c) => {
        const npcId = c.req.param("id");
		const include = parseJobIncludes(c.req.query("include"));

        const service = npcServiceFactory(c.env);
        const npcs = await service.findById(npcId, include);

        return ok(c, npcs);
    })

    return routes
}
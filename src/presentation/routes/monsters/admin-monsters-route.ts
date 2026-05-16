import { Hono } from "hono";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { created } from "../../http";
import { validateCreateActionsInput, validateCreateAffinitiesInput, validateCreateMonsterInput, validateCreateTraitInput } from "../../../validation/monster-validator";
import { MonsterService } from "../../../application/monster-service";
import type { Env } from "../../../types/env";

type MonsterServiceFactory = (env: Env) => MonsterService;

export function createAdminMonstersRoutes(
    monsterServiceFactory: MonsterServiceFactory,
) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);
    
    routes.post("/monsters", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateMonsterInput(rawBody);

        const service = monsterServiceFactory(c.env);
        await service.createMonster(input);

        return created(c, { message: "Monster created successfully" });
    });

    routes.post("/monsters/traits", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateTraitInput(rawBody)

        const service = monsterServiceFactory(c.env);
        await service.createMonsterTrait(input);

        return created(c, { message: "Monster Trait created successfully" });
    })

    routes.post("/monsters/affinities", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateAffinitiesInput(rawBody)

        const service = monsterServiceFactory(c.env);
        await service.createMonsterAffinity(input);

        return created(c, { message: "Monster Affinity created successfully" });
    })

    routes.post("/monsters/actions", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateActionsInput(rawBody)

        const service = monsterServiceFactory(c.env);
        await service.createMonsterAction(input);

        return created(c, { message: "Monster Affinity created successfully" });
    })

    return routes
}
import { Hono } from "hono";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { badRequest, conflict, created } from "../../http";
import { ValidationError } from "../../../domain/domain-errors";
import { MonsterAffinityAlreadyExistsError, MonsterAlreadyExistsError } from "../../../domain/monsters/monster-error";
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
        try {
            const rawBody = await c.req.json();
            const input = validateCreateMonsterInput(rawBody);

            const service = monsterServiceFactory(c.env);
            await service.createMonster(input);

            return created(c, { message: "Monster created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof MonsterAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
           
    });

    routes.post("/monsters/traits", async (c) => {
        try{
            const rawBody = await c.req.json();
            const input = validateCreateTraitInput(rawBody)

            const service = monsterServiceFactory(c.env);
            await service.createMonsterTrait(input);

            return created(c, { message: "Monster Trait created successfully" });
        }
        catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof MonsterAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/monsters/affinities", async (c) => {
        try{
            const rawBody = await c.req.json();
            const input = validateCreateAffinitiesInput(rawBody)

            const service = monsterServiceFactory(c.env);
            await service.createMonsterAffinity(input);

            return created(c, { message: "Monster Affinity created successfully" });
        }
        catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof MonsterAffinityAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    routes.post("/monsters/actions", async (c) => {
        try{
            const rawBody = await c.req.json();
            const input = validateCreateActionsInput(rawBody)

            const service = monsterServiceFactory(c.env);
            await service.createMonsterAction(input);

            return created(c, { message: "Monster Affinity created successfully" });
        }
        catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof MonsterAffinityAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    })

    return routes
}
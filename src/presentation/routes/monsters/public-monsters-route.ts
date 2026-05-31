import { Hono } from "hono";
import { staticCacheMiddleware } from "../../../middleware/cache-middleware";
import type { Env } from "../../../types/env";
import { MonsterService } from "../../../application/monster-service";
import { notFound, ok } from "../../http";
import { MonsterActionIncludes, MonsterInclude } from "../../../domain/monsters/monster";

type MonsterServiceFactory = (env: Env) => MonsterService;

const allowedIncludes: MonsterInclude[] = ["traits", "affinities", "actions"];
const allowedMonsterActionIncludes: MonsterActionIncludes[] = ["basic_attack", "spell", "other_action", "special_rule"]

function parseMonsterIncludes(include?: string): MonsterInclude[] {
    if (!include) {
        return [];
    }

    return include
        .split(",")
        .map((value) => value.trim())
        .filter((value): value is MonsterInclude =>
            allowedIncludes.includes(value as MonsterInclude),
        );
}

function parseMonsterActionsIncludes(include?: string): MonsterActionIncludes[] {
    if (!include) {
        return [];
    }

    return include
        .split(",")
        .map((value) => value.trim())
        .filter((value): value is MonsterActionIncludes =>
            allowedMonsterActionIncludes.includes(value as MonsterActionIncludes),
        );
}

export function createPublicMonstersRoutes(
    monsterServiceFactory: MonsterServiceFactory,
) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", staticCacheMiddleware);

    routes.get("/monsters", async (c) => {
        const service = monsterServiceFactory(c.env)
        const monsters = await service.findAll()

        return ok(c, monsters);
    });

    routes.get("/monsters/summary", async (c) => {
        const service = monsterServiceFactory(c.env)
        const monsters = await service.findAllSummaries()

        return ok(c, monsters);
    });

    routes.get("/monsters/:id{[0-9]+}", async (c) => {
        const monsterId = c.req.param("id");
        const include = parseMonsterIncludes(c.req.query("include"));

        const service = monsterServiceFactory(c.env)
        const monster = await service.findById(monsterId, include)

        if (!monster) {
            return notFound(c, "Job not found");
        }
        
        return ok(c, monster);
    });

    routes.get("/monsters/actions", async (c) => {
        const include = parseMonsterActionsIncludes(c.req.query("include"));

        const service = monsterServiceFactory(c.env)
        const monster = await service.findMonsterActions(include)

        if (!monster) {
            return notFound(c, "Job not found");
        }
        
        return ok(c, monster);
    })

    return routes

}
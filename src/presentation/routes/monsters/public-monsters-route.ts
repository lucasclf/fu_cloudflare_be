import { Hono } from "hono";
import type { Env } from "../../../types/env";
import { MonsterService } from "../../../application/monster-service";
import { notFound, ok } from "../../http";
import { MonsterInclude } from "../../../domain/monsters/monster";

type MonsterServiceFactory = (env: Env) => MonsterService;

const allowedIncludes: MonsterInclude[] = ["traits", "affinities", "actions"];

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

export function createPublicMonstersRoutes(
    monsterServiceFactory: MonsterServiceFactory,
) {
    const routes = new Hono<{ Bindings: Env }>();
    
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

    routes.get("/monsters/:id", async (c) => {
        const monsterId = c.req.param("id");
        const include = parseMonsterIncludes(c.req.query("include"));

        const service = monsterServiceFactory(c.env)
        const monster = await service.findById(monsterId, include)

        if (!monster) {
            return notFound(c, "Job not found");
        }
        
        return ok(c, monster);
    });

    return routes

}
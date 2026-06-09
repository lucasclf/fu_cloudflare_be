import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { MonsterService } from "../../../application/monster-service";
import type { Env } from "../../../types/env";
import {
    monsterListResponse,
    monsterSummaryListResponse,
    monsterResponse,
    monsterActionListResponse,
    monsterIncludeQuerySchema,
} from "../../../schemas/monster-schemas";
import { idParamSchema, notFoundResponse, scopeQuerySchema } from "../../../schemas/common";
import { MonsterActionIncludes, MonsterInclude } from "../../../domain/monsters/monster";

type MonsterServiceFactory = (env: Env) => MonsterService;

const allowedIncludes: MonsterInclude[] = ["traits", "affinities", "actions"];
const allowedActionIncludes: MonsterActionIncludes[] = ["basic_attack", "spell", "other_action", "special_rule"];

function parseMonsterIncludes(include?: string): MonsterInclude[] {
    if (!include) return [];
    return include.split(",").map((v) => v.trim()).filter((v): v is MonsterInclude => allowedIncludes.includes(v as MonsterInclude));
}

function parseActionIncludes(include?: string): MonsterActionIncludes[] {
    if (!include) return [];
    return include.split(",").map((v) => v.trim()).filter((v): v is MonsterActionIncludes => allowedActionIncludes.includes(v as MonsterActionIncludes));
}

export function createPublicMonstersRoutes(monsterServiceFactory: MonsterServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get",
            path: "/monsters",
            tags: ["Monstros"],
            summary: "Listar todos os monstros",
            responses: { 200: { content: { "application/json": { schema: monsterListResponse } }, description: "Lista" } },
        }),
        async (c) => {
            const service = monsterServiceFactory(c.env);
            return c.json({ success: true as const, data: await service.findAll() } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "get",
            path: "/monsters/summary",
            tags: ["Monstros"],
            summary: "Listar resumo de monstros",
            request: { query: scopeQuerySchema },
            responses: { 200: { content: { "application/json": { schema: monsterSummaryListResponse } }, description: "Resumos" } },
        }),
        async (c) => {
            const { scope } = c.req.valid("query");
            const service = monsterServiceFactory(c.env);
            return c.json({ success: true as const, data: await service.findAllSummaries(scope === "global") } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "get",
            path: "/monsters/actions",
            tags: ["Monstros"],
            summary: "Listar ações de monstros",
            description: "Use `?include=basic_attack,spell,other_action,special_rule`",
            request: { query: monsterIncludeQuerySchema },
            responses: { 200: { content: { "application/json": { schema: monsterActionListResponse } }, description: "Ações" } },
        }),
        async (c) => {
            const { include } = c.req.valid("query");
            const service = monsterServiceFactory(c.env);
            const actions = await service.findMonsterActions(parseActionIncludes(include));
            return c.json({ success: true as const, data: actions } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "get",
            path: "/monsters/:id",
            tags: ["Monstros"],
            summary: "Buscar monstro por ID",
            description: "Use `?include=traits,affinities,actions`",
            request: { params: idParamSchema, query: monsterIncludeQuerySchema },
            responses: {
                200: { content: { "application/json": { schema: monsterResponse } }, description: "Monstro" },
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const { id } = c.req.valid("param");
            const { include } = c.req.valid("query");
            const service = monsterServiceFactory(c.env);
            const monster = await service.findById(id, parseMonsterIncludes(include));
            if (!monster) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Monster not found" } }, 404) as any;
            return c.json({ success: true as const, data: monster } as any, 200);
        },
    );

    return routes;
}

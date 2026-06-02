import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { MonsterService } from "../../../application/monster-service";
import type { Env } from "../../../types/env";
import {
    createMonsterSchema,
    createMonsterTraitSchema,
    createMonsterAffinitySchema,
    createMonsterActionSchema,
} from "../../../schemas/monster-schemas";
import { badRequestResponse, conflictResponse, createdResponse } from "../../../schemas/common";

type MonsterServiceFactory = (env: Env) => MonsterService;

export function createAdminMonstersRoutes(monsterServiceFactory: MonsterServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "post", path: "/monsters", tags: ["Monstros"],
            security: [{ adminToken: [] }], summary: "Criar monstro",
            request: { body: { content: { "application/json": { schema: createMonsterSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse },
        }),
        async (c) => {
            const input = c.req.valid("json");
            await monsterServiceFactory(c.env).createMonster(input);
            return c.json({ success: true as const, data: { message: "Monster created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/monsters/traits", tags: ["Monstros"],
            security: [{ adminToken: [] }], summary: "Adicionar trait",
            request: { body: { content: { "application/json": { schema: createMonsterTraitSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse },
        }),
        async (c) => {
            await monsterServiceFactory(c.env).createMonsterTrait(c.req.valid("json"));
            return c.json({ success: true as const, data: { message: "Monster Trait created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/monsters/affinities", tags: ["Monstros"],
            security: [{ adminToken: [] }], summary: "Definir afinidades",
            request: { body: { content: { "application/json": { schema: createMonsterAffinitySchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse },
        }),
        async (c) => {
            await monsterServiceFactory(c.env).createMonsterAffinity(c.req.valid("json"));
            return c.json({ success: true as const, data: { message: "Monster Affinity created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post", path: "/monsters/actions", tags: ["Monstros"],
            security: [{ adminToken: [] }], summary: "Adicionar ação",
            request: { body: { content: { "application/json": { schema: createMonsterActionSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse },
        }),
        async (c) => {
            await monsterServiceFactory(c.env).createMonsterAction(c.req.valid("json"));
            return c.json({ success: true as const, data: { message: "Monster Action created successfully" } } as any, 201);
        },
    );

    return routes;
}

import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { NpcService } from "../../../application/npc-service";
import type { Env } from "../../../types/env";
import { npcSummaryListResponse, npcResponse, npcIncludeQuerySchema } from "../../../schemas/npc-schemas";
import { idParamSchema, notFoundResponse, scopeQuerySchema } from "../../../schemas/common";
import { NpcInclude } from "../../../domain/npc/npc";

type NpcServiceFactory = (env: Env) => NpcService;

const allowedIncludes: NpcInclude[] = ["rules", "inventories", "equipments"];
function parseNpcIncludes(include?: string): NpcInclude[] {
    if (!include) return [];
    return include.split(",").map((v) => v.trim()).filter((v): v is NpcInclude => allowedIncludes.includes(v as NpcInclude));
}

export function createPublicNpcRoutes(npcServiceFactory: NpcServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get", path: "/npcs/summary", tags: ["NPCs"], summary: "Listar resumo de NPCs",
            request: { query: scopeQuerySchema },
            responses: { 200: { content: { "application/json": { schema: npcSummaryListResponse } }, description: "Resumos" } },
        }),
        async (c) => {
            const { scope } = c.req.valid("query");
            return c.json({ success: true as const, data: await npcServiceFactory(c.env).findAllSummary(scope === "global") });
        },
    );

    routes.openapi(
        createRoute({
            method: "get", path: "/npcs/:id", tags: ["NPCs"], summary: "Buscar NPC por ID",
            description: "Use `?include=rules,inventories,equipments`",
            request: { params: idParamSchema, query: npcIncludeQuerySchema },
            responses: {
                200: { content: { "application/json": { schema: npcResponse } }, description: "NPC" },
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const { id } = c.req.valid("param");
            const { include } = c.req.valid("query");
            const npc = await npcServiceFactory(c.env).findById(id, parseNpcIncludes(include));
            if (!npc) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "NPC not found" } }, 404) as any;
            return c.json({ success: true as const, data: npc } as any, 200);
        },
    );

    return routes;
}

import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { SpellService } from "../../../application/spell-service";
import type { Env } from "../../../types/env";
import { spellListResponse } from "../../../schemas/spell-schemas";

type SpellServiceFactory = (env: Env) => SpellService;

export function createPublicSpellsRoutes(spellServiceFactory: SpellServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get",
            path: "/spells",
            tags: ["Feitiços"],
            summary: "Listar todos os feitiços",
            responses: {
                200: { content: { "application/json": { schema: spellListResponse } }, description: "Lista de feitiços" },
            },
        }),
        async (c) => {
            const service = spellServiceFactory(c.env);
            const spells = await service.listSpells();
            return c.json({ success: true as const, data: spells } as any, 200);
        },
    );

    return routes;
}

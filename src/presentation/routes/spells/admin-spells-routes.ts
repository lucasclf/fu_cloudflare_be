import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { SpellService } from "../../../application/spell-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { createSpellSchema } from "../../../schemas/spell-schemas";
import { badRequestResponse, conflictResponse, createdResponse } from "../../../schemas/common";

type SpellServiceFactory = (env: Env) => SpellService;

export function createAdminSpellsRoutes(spellServiceFactory: SpellServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "post",
            path: "/spells",
            tags: ["Feitiços"],
            security: [{ adminToken: [] }],
            summary: "Criar feitiço",
            request: { body: { content: { "application/json": { schema: createSpellSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = spellServiceFactory(c.env);
            await service.createJobSpell(input);
            return c.json({ success: true as const, data: { message: "Job spell created successfully" } } as any, 201);
        },
    );

    return routes;
}

import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { createPowerSchema } from "../../../schemas/power-schemas";
import { badRequestResponse, conflictResponse, createdResponse } from "../../../schemas/common";
import { PowerService } from "../../../application/power-service";

type PowerServiceFactory = (env: Env) => PowerService;

export function createAdminPowersRoutes(powerServiceFactory: PowerServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "post",
            path: "/powers",
            tags: ["Poderes"],
            security: [{ adminToken: [] }],
            summary: "Criar poder",
            description: "O campo `job_id` é um array — um poder pode pertencer a múltiplas profissões.",
            request: { body: { content: { "application/json": { schema: createPowerSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = powerServiceFactory(c.env);
            await service.createJobPower(input);
            return c.json({ success: true as const, data: { message: "Job power created successfully" } } as any, 201);
        },
    );

    return routes;
}

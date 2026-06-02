import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { ScenarioService } from "../../../application/scenario-service";
import type { Env } from "../../../types/env";
import { successResponseSchema } from "../../../schemas/common";

type ScenarioServiceFactory = (env: Env) => ScenarioService;

const scenarioEntitiesResponse = successResponseSchema(z.array(z.record(z.string(), z.unknown())));

export function createPublicScenarioRoutes(scenarioServiceFactory: ScenarioServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get",
            path: "/scenario/entities",
            tags: ["Cenário"],
            summary: "Listar entidades do cenário",
            description: "Retorna localizações, facções e NPCs do cenário em uma única resposta.",
            responses: {
                200: { content: { "application/json": { schema: scenarioEntitiesResponse } }, description: "Entidades do cenário" },
            },
        }),
        async (c) => {
            const service = scenarioServiceFactory(c.env);
            const entities = await service.listEntities();
            return c.json({ success: true as const, data: entities } as any, 200);
        },
    );

    return routes;
}

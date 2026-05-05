import { Hono } from "hono";
import type { Env } from "../../../types/env";
import { ok } from "../../http";
import { ScenarioService } from "../../../application/scenario-service";

type ScenarioServiceFactory = (env: Env) => ScenarioService;

export function createPublicScenarioRoutes(scenarioServiceFactory: ScenarioServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.get("/scenario/entities", async (c) => {
        const service = scenarioServiceFactory(c.env);
        const worlds = await service.listEntities();

        return ok(c, worlds);
    });

    return routes;
}
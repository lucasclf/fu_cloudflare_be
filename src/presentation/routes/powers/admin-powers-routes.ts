import { Hono } from "hono";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { created } from "../../http";
import {
    validateCreateJobPowersInput,
} from "../../../validation/job-validator";
import { PowerService } from "../../../application/power-service";

type PowerServiceFactory = (env: Env) => PowerService;

export function createAdminPowersRoutes(powerServiceFactory: PowerServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.post("/powers", async (c) => {
        const rawBody = await c.req.json();
        const input = validateCreateJobPowersInput(rawBody);

        const service = powerServiceFactory(c.env);
        await service.createJobPower(input);

        return created(c, { message: "Job power created successfully" });
    });

    return routes;
}

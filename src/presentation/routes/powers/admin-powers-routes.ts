import { Hono } from "hono";
import { ValidationError } from "../../../domain/domain-errors";
import {
    JobNotFoundError,
    JobPowerAlreadyExistsError,
} from "../../../domain/jobs/job-errors";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { badRequest, conflict, created, notFound, ok } from "../../http";
import {
    validateCreateJobPowersInput,
} from "../../../validation/job-validator";
import { PowerService } from "../../../application/power-service";

type PowerServiceFactory = (env: Env) => PowerService;

export function createAdminPowersRoutes(powerServiceFactory: PowerServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.post("/powers", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreateJobPowersInput(rawBody);

            const service = powerServiceFactory(c.env);
            await service.createJobPower(input);

            return created(c, { message: "Job power created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof JobNotFoundError) {
                return notFound(c, error.message);
            }

            if (error instanceof JobPowerAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    });

    return routes;
}

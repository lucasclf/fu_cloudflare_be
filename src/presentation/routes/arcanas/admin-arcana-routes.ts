import { Hono } from "hono";
import { JobService } from "../../../application/job-service";
import { ValidationError } from "../../../domain/domain-errors";
import { ArcanaAlreadyExistsError } from "../../../domain/jobs/job-errors";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { validateCreateArcanaInput } from "../../../validation/job-validator";
import { badRequest, conflict, created } from "../../http";
import { ArcanaService } from "../../../application/arcana-service";
import type { Env } from "../../../types/env";


type ArcanaServiceFactory = (env: Env) => ArcanaService;

export function createAdminArcanaRoutes(jobServiceFactory: ArcanaServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);
    routes.post("/arcanas", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreateArcanaInput(rawBody);

            const service = jobServiceFactory(c.env);
            await service.createArcana(input);

            return created(c, { message: "Arcana created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof ArcanaAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    });

    return routes;
}
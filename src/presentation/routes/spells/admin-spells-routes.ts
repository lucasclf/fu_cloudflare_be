import { Hono } from "hono";
import type { JobService } from "../../../application/job-service";
import { ValidationError } from "../../../domain/domain-errors";
import {
    JobNotFoundError,
    JobSpellAlreadyExistsError,
} from "../../../domain/jobs/job-errors";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { badRequest, conflict, created, notFound } from "../../http";
import {
    validateCreateJobSpellsInput,
} from "../../../validation/job-validator";
import { SpellService } from "../../../application/spell-service";

type SpellServiceFactory = (env: Env) => SpellService;

export function createAdminSpellsRoutes(spellServiceFactory: SpellServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.post("/spells", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreateJobSpellsInput(rawBody);

            const service = spellServiceFactory(c.env);
            await service.createJobSpell(input);

            return created(c, { message: "Job spell created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof JobNotFoundError) {
                return notFound(c, error.message);
            }

            if (error instanceof JobSpellAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    });

    return routes;
}

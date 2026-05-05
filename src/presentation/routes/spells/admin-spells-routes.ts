import { Hono } from "hono";
import { ValidationError } from "../../../domain/domain-errors";
import {
    JobNotFoundError,
} from "../../../domain/jobs/job-errors";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { badRequest, conflict, created, notFound } from "../../http";

import { SpellService } from "../../../application/spell-service";
import { validateCreateJobSpellsInput } from "../../../validation/spell-validator";
import { SpellAlreadyExistsError } from "../../../domain/spells/spell-errors";

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

            if (error instanceof SpellAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    });

    return routes;
}


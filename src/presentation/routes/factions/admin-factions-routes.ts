import { Hono } from "hono";
import { ValidationError } from "../../../domain/domain-errors";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { badRequest, conflict, created, notFound } from "../../http";
import { FactionAlreadyExistsError, FactionNotFoundError } from "../../../domain/factions/faction-errors";
import { validateCreateFactionsInput } from "../../../validation/faction-validator";
import { FactionService } from "../../../application/faction-service";

type FactionServiceFactory = (env: Env) => FactionService;

export function createAdminFactionsRoutes(factionServiceFactory: FactionServiceFactory) {
    const routes = new Hono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.post("/factions", async (c) => {
        try {
            const rawBody = await c.req.json();
            const input = validateCreateFactionsInput(rawBody);

            const service = factionServiceFactory(c.env);
            await service.createFaction(input);

            return created(c, { message: "Faction created successfully" });
        } catch (error) {
            if (error instanceof ValidationError) {
                return badRequest(c, error.message);
            }

            if (error instanceof FactionNotFoundError) {
                return notFound(c, error.message);
            }

            if (error instanceof FactionAlreadyExistsError) {
                return conflict(c, error.message);
            }

            throw error;
        }
    });

    return routes;
}
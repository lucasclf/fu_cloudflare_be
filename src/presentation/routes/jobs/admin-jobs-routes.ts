import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { JobService } from "../../../application/job-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import {
    createJobSchema,
    createJobQuestionSchema,
    createJobAliasSchema,
} from "../../../schemas/job-schemas";
import { badRequestResponse, conflictResponse, createdResponse } from "../../../schemas/common";

type JobServiceFactory = (env: Env) => JobService;

export function createAdminJobsRoutes(jobServiceFactory: JobServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.use("*", adminAuthMiddleware);

    routes.openapi(
        createRoute({
            method: "post",
            path: "/jobs",
            tags: ["Profissões"],
            security: [{ adminToken: [] }],
            summary: "Criar profissão",
            request: { body: { content: { "application/json": { schema: createJobSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = jobServiceFactory(c.env);
            await service.createJob(input);
            return c.json({ success: true as const, data: { message: "Job created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post",
            path: "/jobs/questions",
            tags: ["Profissões"],
            security: [{ adminToken: [] }],
            summary: "Adicionar pergunta de background",
            request: { body: { content: { "application/json": { schema: createJobQuestionSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = jobServiceFactory(c.env);
            await service.createJobQuestion(input);
            return c.json({ success: true as const, data: { message: "Job question created successfully" } } as any, 201);
        },
    );

    routes.openapi(
        createRoute({
            method: "post",
            path: "/jobs/aliases",
            tags: ["Profissões"],
            security: [{ adminToken: [] }],
            summary: "Adicionar nome alternativo",
            request: { body: { content: { "application/json": { schema: createJobAliasSchema } } } },
            responses: { 201: createdResponse, 400: badRequestResponse, 409: conflictResponse },
        }),
        async (c) => {
            const input = c.req.valid("json");
            const service = jobServiceFactory(c.env);
            await service.createJobAlias(input);
            return c.json({ success: true as const, data: { message: "Job alias created successfully" } } as any, 201);
        },
    );

    return routes;
}

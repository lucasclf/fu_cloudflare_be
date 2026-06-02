import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import type { JobService } from "../../../application/job-service";
import type { Env } from "../../../types/env";
import { JobInclude } from "../../../domain/jobs/job";
import {
    jobListResponse,
    jobCatalogResponse,
    jobResponse,
    jobIncludeQuerySchema,
    jobJobIdParamSchema,
} from "../../../schemas/job-schemas";
import { notFoundResponse } from "../../../schemas/common";

type JobServiceFactory = (env: Env) => JobService;

const allowedIncludes: JobInclude[] = ["background", "powers", "spells"];

function parseJobIncludes(include?: string): JobInclude[] {
    if (!include) return [];
    return include.split(",").map((v) => v.trim()).filter((v): v is JobInclude => allowedIncludes.includes(v as JobInclude));
}

export function createPublicJobsRoutes(jobServiceFactory: JobServiceFactory) {
    const routes = new OpenAPIHono<{ Bindings: Env }>();

    routes.openapi(
        createRoute({
            method: "get",
            path: "/jobs",
            tags: ["Profissões"],
            summary: "Listar profissões",
            description: "Use `?include=background,powers,spells` para enriquecer os dados.",
            request: { query: jobIncludeQuerySchema },
            responses: {
                200: { content: { "application/json": { schema: jobListResponse } }, description: "Lista de profissões" },
            },
        }),
        async (c) => {
            const { include } = c.req.valid("query");
            const service = jobServiceFactory(c.env);
            const jobs = await service.listJobs(parseJobIncludes(include));
            return c.json({ success: true as const, data: jobs } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "get",
            path: "/jobs/catalog",
            tags: ["Profissões"],
            summary: "Catálogo resumido de profissões",
            responses: {
                200: { content: { "application/json": { schema: jobCatalogResponse } }, description: "Catálogo" },
            },
        }),
        async (c) => {
            const service = jobServiceFactory(c.env);
            const jobs = await service.listCatalogJobs();
            return c.json({ success: true as const, data: jobs } as any, 200);
        },
    );

    routes.openapi(
        createRoute({
            method: "get",
            path: "/jobs/:id",
            tags: ["Profissões"],
            summary: "Buscar profissão por ID",
            request: { params: jobJobIdParamSchema, query: jobIncludeQuerySchema },
            responses: {
                200: { content: { "application/json": { schema: jobResponse } }, description: "Profissão" },
                404: notFoundResponse,
            },
        }),
        async (c) => {
            const { id } = c.req.valid("param");
            const { include } = c.req.valid("query");
            const service = jobServiceFactory(c.env);
            const job = await service.getJobById(id, parseJobIncludes(include));
            if (!job) return c.json({ success: false as const, error: { code: "NOT_FOUND", message: "Job not found" } }, 404) as any;
            return c.json({ success: true as const, data: job } as any, 200);
        },
    );

    return routes;
}

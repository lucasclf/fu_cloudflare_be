import { Hono } from "hono";
import type { JobService } from "../../../application/job-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { notFound, ok } from "../../http";
import { JobInclude } from "../../../domain/jobs/job";

type JobServiceFactory = (env: Env) => JobService;

const allowedIncludes: JobInclude[] = ["background", "powers", "spells"];

function parseJobIncludes(include?: string): JobInclude[] {
	if (!include) {
		return [];
	}

	return include
		.split(",")
		.map((value) => value.trim())
		.filter((value): value is JobInclude =>
			allowedIncludes.includes(value as JobInclude),
		);
}

export function createPublicJobsRoutes(jobServiceFactory: JobServiceFactory) {
	const routes = new Hono<{ Bindings: Env }>();

	routes.get("/jobs", async (c) => {
		const includes = parseJobIncludes(c.req.query("include"));

		const service = jobServiceFactory(c.env);

		const jobs = await service.listJobs(includes);
		return ok(c, jobs);
	});

	routes.get("/jobs/catalog", async (c) => {
		const includes = parseJobIncludes(c.req.query("include"));

		const service = jobServiceFactory(c.env);

		const jobs = await service.listCatalogJobs(includes);
		return ok(c, jobs);
	});

	routes.get("/jobs/:id", async (c) => {
		const jobId = c.req.param("id");
		const include = c.req.query("include");

		const service = jobServiceFactory(c.env);
		const job = await service.getJobById(jobId, include);

		if (!job) {
			return notFound(c, "Job not found");
		}

		return ok(c, job);
	});

	return routes;
}

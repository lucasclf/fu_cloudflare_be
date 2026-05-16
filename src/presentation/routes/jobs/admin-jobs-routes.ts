import { Hono } from "hono";
import type { JobService } from "../../../application/job-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { created } from "../../http";
import {
	validateCreateJobAliasesInput,
	validateCreateJobInput,
	validateCreateJobQuestionsInput,
} from "../../../validation/job-validator";


type JobServiceFactory = (env: Env) => JobService;

export function createAdminJobsRoutes(jobServiceFactory: JobServiceFactory) {
	const routes = new Hono<{ Bindings: Env }>();

	routes.use("*", adminAuthMiddleware);

	routes.post("/jobs", async (c) => {
		const rawBody = await c.req.json();
		const input = validateCreateJobInput(rawBody);

		const service = jobServiceFactory(c.env);
		await service.createJob(input);

		return created(c, { message: "Job created successfully" });
	});

	routes.post("/jobs/questions", async (c) => {
		const rawBody = await c.req.json();
		const input = validateCreateJobQuestionsInput(rawBody);

		const service = jobServiceFactory(c.env);
		await service.createJobQuestion(input);

		return created(c, { message: "Job created successfully" });
	});

	routes.post("/jobs/aliases", async (c) => {
		const rawBody = await c.req.json();
		const input = validateCreateJobAliasesInput(rawBody);

		const service = jobServiceFactory(c.env);
		await service.createJobAlias(input);

		return created(c, { message: "Job alias created successfully" });
	
	});

	return routes
}

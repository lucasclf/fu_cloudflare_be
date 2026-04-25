import { Hono } from "hono";
import type { JobService } from "../../../application/job-service";
import { ValidationError } from "../../../domain/domain-errors";
import { JobAliasAlreadyExistsError, JobAlreadyExistsError, JobNotFoundError, JobQuestionAlreadyExistsError } from "../../../domain/jobs/job-errors";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import type { Env } from "../../../types/env";
import { badRequest, conflict, created, notFound, ok } from "../../http";
import { validateCreateJobAliasesInput, validateCreateJobInput, validateCreateJobQuestionsInput } from "../../../validation/job-validator";

type JobServiceFactory = (env: Env) => JobService;

export function createAdminJobsRoutes(jobServiceFactory: JobServiceFactory) {
	const routes = new Hono<{ Bindings: Env }>();

	routes.use("*", adminAuthMiddleware);

	routes.post("/jobs", async (c) => {
		try {
			const rawBody = await c.req.json();
			const input = validateCreateJobInput(rawBody);

			const service = jobServiceFactory(c.env);
			await service.createJob(input);

			return created(c, { message: "Job created successfully" });
		} catch (error) {
			if (error instanceof ValidationError) {
				return badRequest(c, error.message);
			}

			if (error instanceof JobAlreadyExistsError) {
				return conflict(c, error.message);
			}

			throw error;
		}
	});

	routes.post("/jobs/questions", async (c) => {
		try {
			const rawBody = await c.req.json();
			const input = validateCreateJobQuestionsInput(rawBody);

			const service = jobServiceFactory(c.env);
			await service.createJobQuestion(input);

			return created(c, { message: "Job created successfully" });
		} catch (error) {
			if (error instanceof ValidationError) {
				return badRequest(c, error.message);
			}

			if (error instanceof JobNotFoundError) {
				return notFound(c, error.message);
			}

			if (error instanceof JobQuestionAlreadyExistsError) {
				return conflict(c, error.message);
			}

			throw error;
		}
	});

	routes.post("/jobs/aliases", async (c) => {
		try {
			const rawBody = await c.req.json();
			const input = validateCreateJobAliasesInput(rawBody);

			const service = jobServiceFactory(c.env);
			await service.createJobAlias(input);

			return created(c, { message: "Job alias created successfully" });
		} catch (error) {
			if (error instanceof ValidationError) {
				return badRequest(c, error.message);
			}

			if (error instanceof JobNotFoundError) {
				return notFound(c, error.message);
			}

			if (error instanceof JobAliasAlreadyExistsError) {
				return conflict(c, error.message);
			}

			throw error;
		}
	});

	return routes;
}

import { Hono } from "hono";
import type { Env } from "../../../types/env";
import { JobService } from "../../../application/job-service";
import { adminAuthMiddleware } from "../../../middleware/admin-auth-middleware";
import { notFound, ok } from "../../http";

type JobServiceFactory = (env: Env) => JobService;

export function createPublicJobsRoutes(jobServiceFactory: JobServiceFactory){
    const routes = new Hono<{ Bindings: Env }>();
    
    routes.get("/jobs", async (c) => {
                const service = jobServiceFactory(c.env);
                const jobs = await service.listJobs();
            
                return ok(c, jobs);
                });

    routes.get("/jobs/:id", async (c) => {
                const jobId = c.req.param("id");
            
                const service = jobServiceFactory(c.env);
                const job = await service.getJobById(jobId);
            
                if (!job) {
                    return notFound(c, "Job not found");
                }
            
                return ok(c, job);
            });

    routes.get("/jobs/by-name/:jobName", async (c) => {
                const jobName = c.req.param("jobName");
            
                const service = jobServiceFactory(c.env);
                const job = await service.getJobByName(jobName);
            
                if (!job) {
                    return notFound(c, "Job not found");
                }
            
                return ok(c, job);
            });
    
    return routes;

}
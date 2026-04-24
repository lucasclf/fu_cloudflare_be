import type { Env } from "../types/env";
import { D1JobRepository } from "../infrastructure/d1-job-repository";
import { JobService } from "../application/job-service";

export function createJobService(env: Env): JobService {
  const repository = new D1JobRepository(env.fabula_ultima_db);
  return new JobService(repository);
}
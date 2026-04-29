import { JobService } from "../application/job-service";
import { D1JobBackgroundRepository } from "../infrastructure/d1-job-background-repository";
import { D1JobPowerRepository } from "../infrastructure/d1-job-power-repository";
import { D1JobRepository } from "../infrastructure/d1-job-repository";
import { D1JobSpellRepository } from "../infrastructure/d1-job-spell-repository";
import type { Env } from "../types/env";

export function createJobService(env: Env): JobService {
	const jobRepository = new D1JobRepository(env.fabula_ultima_db);
	const jobBackgroundRepository = new D1JobBackgroundRepository(
		env.fabula_ultima_db,
	);
	const jobPowerRepository = new D1JobPowerRepository(env.fabula_ultima_db);
	const jobSpellRepository = new D1JobSpellRepository(env.fabula_ultima_db);

	return new JobService(
		jobRepository,
		jobBackgroundRepository,
		jobPowerRepository,
		jobSpellRepository,
	);
}

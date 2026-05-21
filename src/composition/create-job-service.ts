import { JobService } from "../application/job-service";
import { D1ArcanaRepository } from "../infrastructure/repository/d1-arcana-repository";
import { D1JobAliasesRepository } from "../infrastructure/repository/d1-job-background-repository";
import { D1JobPowerRepository } from "../infrastructure/repository/d1-job-power-repository";
import { D1JobQuestionsRepository } from "../infrastructure/repository/d1-job-questions-repository";
import { D1JobRepository } from "../infrastructure/repository/d1-job-repository";
import { D1JobSpellRepository } from "../infrastructure/repository/d1-job-spell-repository";
import type { Env } from "../types/env";

export function createJobService(env: Env): JobService {
	const jobRepository = new D1JobRepository(env.fabula_ultima_db);
	const jobQuestionsRepository = new D1JobQuestionsRepository(env.fabula_ultima_db,);
	const jobAliasesRepository = new D1JobAliasesRepository( env.fabula_ultima_db);
	const jobPowerRepository = new D1JobPowerRepository(env.fabula_ultima_db);
	const jobSpellRepository = new D1JobSpellRepository(env.fabula_ultima_db);
	const arcanaRepository = new D1ArcanaRepository(env.fabula_ultima_db)

	return new JobService(
		jobRepository,
		jobQuestionsRepository,
		jobAliasesRepository,
		jobPowerRepository,
		jobSpellRepository,
		arcanaRepository
	);
}

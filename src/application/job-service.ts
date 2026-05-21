import {
	CreateJobAliasInput,
	CreateJobInput,
	CreateJobPowerInput,
	CreateJobQuestionInput,
	Job,
	JobFull,
	ResumeJob,
} from "../domain/jobs/job";
import { JobRepositoryPort, JobQuestionsRepositoryPort, JobPowerRepositoryPort, JobSpellRepositoryPort, ArcanaRepositoryPort, JobAliasesRepositoryPort } from "./ports/job-ports";

export class JobService {
	constructor(
		private readonly jobRepository: JobRepositoryPort,
		private readonly jobQuestionsRepository: JobQuestionsRepositoryPort,
		private readonly jobAliasesRepository: JobAliasesRepositoryPort,
		private readonly jobPowerRepository: JobPowerRepositoryPort,
		private readonly jobSpellRepository: JobSpellRepositoryPort,
		private readonly arcanaRepository: ArcanaRepositoryPort,
	) {}

	async listJobs(includes: string[]): Promise<Job[] | JobFull[]> {
		const jobs = await this.jobRepository.findAll();

		if (jobs.length === 0 || includes.length === 0) {
			return jobs;
		}

		return this.enrichJobs(jobs, includes);
	}

	async listCatalogJobs(includes: string[]): Promise<ResumeJob[]> {
		const jobs = await this.jobRepository.findAllSummary();

		if (jobs.length === 0 || includes.length === 0) {
			return jobs;
		}

		return jobs;
	}

	async getJobById(
		jobId: string,
		includes: string[],
	): Promise<Job | JobFull | null> {
		const job = await this.jobRepository.findById(jobId);

		if (!job) {
			return null;
		}

		if (includes.length === 0) {
			return job;
		}

		const [jobFull] = await this.enrichJobs([job], includes);

		return jobFull;
	}

	private async enrichJobs(
		jobs: Job[],
		includes: string[],
	): Promise<JobFull[]> {
		const jobIds = jobs.map((job) => job.id);

		const jobsFull: JobFull[] = jobs.map((job) => ({
			...job,
		}));

		if (includes.includes("background")) {
			const [questionsByJobId, aliasesByJobId] = await Promise.all([
				this.jobQuestionsRepository.findByJobIds(jobIds),
				this.jobAliasesRepository.findByJobIds(jobIds),
			]);

			for (const job of jobsFull) {
				job.questions = questionsByJobId.get(job.id) ?? [];
				job.aliases = aliasesByJobId.get(job.id) ?? [];
			}
		}

		if (includes.includes("powers")) {
			const powersByJobId =
				await this.jobPowerRepository.findByJobIds(jobIds);

			for (const job of jobsFull) {
				job.powers = powersByJobId.get(job.id) ?? [];
			}
		}

		if (includes.includes("spells")) {
			const spellsByJobId = await this.jobSpellRepository.findByJobIds(jobIds);

			const hasArcaneJobs = jobsFull.some((job) => job.allows_arcane);

			const arcanas = hasArcaneJobs
				? await this.arcanaRepository.findAll()
				: [];

			for (const job of jobsFull) {
				job.spells = spellsByJobId.get(job.id) ?? [];

				if (job.allows_arcane) {
					job.arcanas = arcanas;
				}
			}
		}

		return jobsFull;
	}

	async createJob(input: CreateJobInput): Promise<void> {
		await this.jobRepository.create(input);
	}

	async createJobQuestion(input: CreateJobQuestionInput): Promise<void> {
		await this.jobQuestionsRepository.create(input);
	}

	async createJobAlias(input: CreateJobAliasInput): Promise<void> {
		await this.jobAliasesRepository.create(input);
	}

	async createJobPower(input: CreateJobPowerInput): Promise<void> {
		await this.jobPowerRepository.create(input);
	}
}

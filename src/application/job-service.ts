import {
	CreateArcanaInput,
	CreateJobAliasInput,
	CreateJobInput,
	CreateJobPowerInput,
	CreateJobQuestionInput,
	Job,
	JobFull,
	ResumeJob,
} from "../domain/jobs/job";
import { D1ArcanaRepository } from "../infrastructure/d1-arcana-repository";
import { D1JobBackgroundRepository } from "../infrastructure/d1-job-background-repository";
import { D1JobPowerRepository } from "../infrastructure/d1-job-power-repository";
import type { D1JobRepository } from "../infrastructure/d1-job-repository";
import { D1JobSpellRepository } from "../infrastructure/d1-job-spell-repository";

export class JobService {
	constructor(
		private readonly jobRepository: D1JobRepository,
		private readonly jobBackgroundRepository: D1JobBackgroundRepository,
		private readonly jobPowerRepository: D1JobPowerRepository,
		private readonly jobSpellRepository: D1JobSpellRepository,
		private readonly arcanaRepository: D1ArcanaRepository
	) {}

	async listJobs(includes: string[]): Promise<Job[] | JobFull[]> {
		const jobs = await this.jobRepository.findAll();

		if (jobs.length === 0 || includes.length === 0) {
			return jobs;
		}

		return this.enrichJobs(jobs, includes);
	}

	async listCatalogJobs(includes: string[]): Promise<ResumeJob[]> {
		const jobs = await this.jobRepository.findCatalogJobs();

		if (jobs.length === 0 || includes.length === 0) {
			return jobs;
		}

		return jobs;
	}

	async getJobById(
		jobId: string,
		includes: string[],
	): Promise<Job | JobFull | null> {
		const job = await this.jobRepository.findByJobId(jobId);

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
				this.jobBackgroundRepository.findQuestionsByJobIds(jobIds),
				this.jobBackgroundRepository.findAliasesByJobIds(jobIds),
			]);

			for (const job of jobsFull) {
				job.questions = questionsByJobId.get(job.id) ?? [];
				job.aliases = aliasesByJobId.get(job.id) ?? [];
			}
		}

		if (includes.includes("powers")) {
			const powersByJobId =
				await this.jobPowerRepository.findPowersByJobIds(jobIds);

			for (const job of jobsFull) {
				job.powers = powersByJobId.get(job.id) ?? [];
			}
		}

		if (includes.includes("spells")) {
			const spellsByJobId = await this.jobSpellRepository.findSpellsByJobIds(jobIds);

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
		await this.jobBackgroundRepository.createJobQuestion(input);
	}

	async createJobAlias(input: CreateJobAliasInput): Promise<void> {
		await this.jobBackgroundRepository.createJobAlias(input);
	}

	async createJobPower(input: CreateJobPowerInput): Promise<void> {
		await this.jobPowerRepository.createJobPower(input);
	}

	async createArcana(input: CreateArcanaInput): Promise<void> {
		await this.arcanaRepository.create(input);
	}
}

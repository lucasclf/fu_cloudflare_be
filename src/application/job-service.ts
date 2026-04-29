import {
	CreateJobAliasInput,
	CreateJobInput,
	CreateJobPowerInput,
	CreateJobQuestionInput,
	CreateJobSpellInput,
	Job,
	JobFull,
	ResumeJob,
} from "../domain/jobs/job";
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
			
				for (const job of jobsFull) {
				job.spells = spellsByJobId.get(job.id) ?? [];
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
}

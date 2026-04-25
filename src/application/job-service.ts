import { CreateJobAliasInput, CreateJobInput, CreateJobQuestionInput, Job, JobFull } from "../domain/jobs/job";
import type { D1JobRepository } from "../infrastructure/d1-job-repository";

export class JobService {
	constructor(private readonly repository: D1JobRepository) {}

	async listJobs(include?: string): Promise<Job[] | JobFull[]> {
		if (include === "details") {
			return this.repository.findAllFull();
		}

		return this.repository.findAll();
	}

	async getJobByName(jobName: string): Promise<Job | null> {
		return this.repository.findByJobName(jobName);
	}

	async getJobById(jobId: string, include?: string): Promise<Job | JobFull | null> {
		if (include === "details") {
			return this.repository.findByJobIdFull(jobId);
		}

		return this.repository.findByJobId(jobId);
	}

	async createJob(input: CreateJobInput): Promise<void> {
		await this.repository.create(input);
	}

	async createJobQuestion(input: CreateJobQuestionInput): Promise<void> {
		await this.repository.createJobQuestion(input);
	}

	async createJobAlias(input: CreateJobAliasInput): Promise<void> {
		await this.repository.createJobAlias(input);
	}

	/* async updateJob(jobId: number, input: UpdateJobInput): Promise<void> {
    await this.repository.updateByJobId(jobId, input);
  }

  async deleteJob(jobId: number): Promise<void> {
    await this.repository.deleteByJobId(jobId);
  } */
}

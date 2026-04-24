import { D1JobRepository } from "../infrastructure/d1-job-repository";

export class JobService {
  constructor(private readonly repository: D1JobRepository) {}

  async listJobs(): Promise<Job[]> {
    return this.repository.findAll();
  }

  async getJobByName(jobName: string): Promise<Job | null> {
    return this.repository.findByJobName(jobName);
  }

  async getJobById(jobId: string): Promise<Job | null> {
    return this.repository.findByJobId(jobId);
  }

  async createJob(input: CreateJobInput): Promise<void> {
    await this.repository.create(input);
  }

  /* async updateJob(jobId: number, input: UpdateJobInput): Promise<void> {
    await this.repository.updateByJobId(jobId, input);
  }

  async deleteJob(jobId: number): Promise<void> {
    await this.repository.deleteByJobId(jobId);
  } */
}
import { CreateJobPowerInput, JobPowerWithJob} from "../domain/jobs/job";
import { D1JobPowerRepository } from "../infrastructure/d1-job-power-repository";


export class PowerService {
    constructor(

        private readonly jobPowerRepository: D1JobPowerRepository,
    ) {}

    async createJobPower(input: CreateJobPowerInput): Promise<void> {
        await this.jobPowerRepository.createJobPower(input);
    }

    async listPowers(): Promise<JobPowerWithJob[]> {
        return await this.jobPowerRepository.listPowers();
    }
}
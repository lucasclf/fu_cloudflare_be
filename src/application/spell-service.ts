import { CreateJobSpellInput, JobSpell, JobSpellWithJob } from "../domain/jobs/job";
import { D1JobSpellRepository } from "../infrastructure/d1-job-spell-repository";


export class SpellService {
    constructor(

        private readonly jobSpellRepository: D1JobSpellRepository,
    ) {}

	async createJobSpell(input: CreateJobSpellInput): Promise<void> {
		await this.jobSpellRepository.createJobSpell(input);
	}

    async listSpells(): Promise<JobSpellWithJob[]> {
        return await this.jobSpellRepository.listSpells();
    }
}
import { CreateJobSpellInput, JobSpellWithJob, MonsterSpell } from "../domain/spells/spells";
import { D1JobSpellRepository } from "../infrastructure/d1-job-spell-repository";
import { D1MonsterActionRepository } from "../infrastructure/d1-monster-action-repository";


export class SpellService {
    constructor(
        private readonly jobSpellRepository: D1JobSpellRepository,
        private readonly monsterActionRepository: D1MonsterActionRepository,
    ) {}

	async createJobSpell(input: CreateJobSpellInput): Promise<void> {
		await this.jobSpellRepository.createJobSpell(input);
	}

    async listSpells(): Promise<(JobSpellWithJob | MonsterSpell)[]> {
        const jobSpells = await this.jobSpellRepository.listSpells();
        const monsterSpells = await this.monsterActionRepository.listMonsterSpells()
        
        return [...jobSpells, ...monsterSpells];
    }
}
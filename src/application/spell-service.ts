import { CreateJobSpellInput, JobSpellWithJob, MonsterSpell } from "../domain/spells/spells";
import { D1JobSpellRepository } from "../infrastructure/repository/d1-job-spell-repository";
import { MonsterSpellRepositoryPort } from "./ports/spell-ports";


export class SpellService {
    constructor(
		private readonly jobSpellRepository: D1JobSpellRepository,
		private readonly monsterActionRepository: MonsterSpellRepositoryPort,
    ) {}

	async createJobSpell(input: CreateJobSpellInput): Promise<void> {
		await this.jobSpellRepository.create(input);
	}

    async listSpells(globalOnly?: boolean): Promise<(JobSpellWithJob | MonsterSpell)[]> {
        const jobSpells = await this.jobSpellRepository.findAll(globalOnly);
        const monsterSpells = await this.monsterActionRepository.listSpells();

        return [...jobSpells, ...monsterSpells];
    }
}
import { CreateMonsterInput, CreateMonsterTraitInput, Monster, MonsterFull, MonsterSummary } from "../domain/monsters/monster";
import { D1MonsterRepository } from "../infrastructure/d1-monster-repository";
import { D1MonsterTraitRepository } from "../infrastructure/d1-monster-trait-repository";

export class MonsterService {
    constructor(
        private readonly monsterRepository: D1MonsterRepository,
        private readonly monsterTraitRepository: D1MonsterTraitRepository
    ) {}

    async createMonster(input: CreateMonsterInput): Promise<void> {
        await this.monsterRepository.createMonster(input)
    }

    async createMonsterTrait(input: CreateMonsterTraitInput): Promise<void> {
        await this.monsterTraitRepository.createMonsterTrait(input)
    }

    async findAll(): Promise<Monster[]> {
        return await this.monsterRepository.findAll();
    }

    async findAllSummaries(): Promise<MonsterSummary[]> {
        return await this.monsterRepository.findAllSummaries();
    }

    async findById(
        monsterId: string,
        includes: string[], 
    ): Promise<Monster | MonsterFull | null>{
        const monster = await this.monsterRepository.findById(monsterId)

        if (!monster) {
			return null;
		}

		if (includes.length === 0) {
			return monster;
		}

        const [monsterFull] = await this.enrichJobs([monster], includes);

		return monsterFull;
    }

    private async enrichJobs(
            monsters: Monster[],
            includes: string[],
        ): Promise<MonsterFull[]> {
            const monsterIds = monsters.map((monster) => monster.id);
    
            const monstersFull: MonsterFull[] = monsters.map((monster) => ({
                ...monster,
            }));
    
            if (includes.includes("traits")) {
                const traitsByMonsterId = 
                    await this.monsterTraitRepository.findByMonstersIds(monsterIds)
                
                for (const monster of monstersFull) {
                    monster.traits = traitsByMonsterId.get(monster.id) ?? [];
                }
            }
    
            return monstersFull;
        }
}
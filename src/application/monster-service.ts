import { CreateActionInput, CreateAffinityInput, CreateMonsterInput, CreateMonsterTraitInput, Monster, MonsterAction, MonsterFull, MonsterSummary } from "../domain/monsters/monster";
import { MonsterRepositoryPort, MonsterTraitRepositoryPort, MonsterAffinityRepositoryPort, MonsterActionRepositoryPort } from "./ports/monster-ports";

export class MonsterService {
    constructor(
        private readonly monsterRepository: MonsterRepositoryPort,
		private readonly monsterTraitRepository: MonsterTraitRepositoryPort,
		private readonly monsterAffinityRepository: MonsterAffinityRepositoryPort,
		private readonly monsterActionRepository: MonsterActionRepositoryPort,
    ) {}

    async createMonster(input: CreateMonsterInput): Promise<void> {
        await this.monsterRepository.create(input)
    }

    async createMonsterTrait(input: CreateMonsterTraitInput): Promise<void> {
        await this.monsterTraitRepository.create(input)
    }

    async createMonsterAffinity(input: CreateAffinityInput): Promise<void> {
        await this.monsterAffinityRepository.create(input)
    }

    async createMonsterAction(input: CreateActionInput): Promise<void> {
        await this.monsterActionRepository.create(input)
    }

    async findAll(): Promise<Monster[]> {
        return await this.monsterRepository.findAll();
    }

    async findAllSummaries(globalOnly?: boolean): Promise<MonsterSummary[]> {
        return await this.monsterRepository.findAllSummary(globalOnly);
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

    async findMonsterActions(includes: string[]): Promise<MonsterAction[]>{
        const actions = await this.monsterActionRepository.findAll(includes)
        return actions;
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

        if (includes.includes("affinities")) {
            const affinitiesByMonsterId =
                await this.monsterAffinityRepository.findByMonstersIds(monsterIds);

            for (const monster of monstersFull) {
                monster.affinities = affinitiesByMonsterId.get(monster.id);
            }
        }

        if (includes.includes("actions")) {
            const actionsByMonsterId = 
                await this.monsterActionRepository.findByMonstersIds(monsterIds)

            for (const monster of monstersFull) {
                monster.actions = actionsByMonsterId.get(monster.id) ?? [];
            }
        }

        return monstersFull;
    }
}
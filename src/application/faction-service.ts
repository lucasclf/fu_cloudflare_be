import { CreateFactionInput, Faction } from "../domain/factions/faction";
import { D1FactionLocationRepository } from "../infrastructure/d1-faction-location-repository";
import { D1FactionRepository } from "../infrastructure/d1-faction-repository";

export class FactionService {
    constructor(
        private readonly relationRepository: D1FactionLocationRepository,
        private readonly factionRepository: D1FactionRepository,
    ) {}   

    async createFaction(input: CreateFactionInput): Promise<void> {
        await this.factionRepository.create(input);
    }

    async listFactions(): Promise<Faction[]> {
        const factions = await this.factionRepository.listFactions();

		if (factions.length === 0) {
			return [];
		}

        const factionIds = factions.map((faction) => faction.id);

        const relationsByFactionId =
			await this.relationRepository.findRelationsByFactionIds(
				factionIds,
			);
            
        return factions.map((faction) => ({
			...faction,
			location_relations: relationsByFactionId.get(faction.id) ?? [],
		}));
    }

    async getFactionById(id: number): Promise<Faction | null> {
        const faction = await this.factionRepository.getFactionById(id);

		if (!faction) {
			return null;
		}

		const locationRelations =
			await this.relationRepository.findRelationsByFactionId(id);

		return {
			...faction,
			location_relations: locationRelations,
		};
    }
}
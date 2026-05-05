import { WorldEntry } from "../domain/scenario/scenario";
import { D1FactionLocationRepository } from "../infrastructure/d1-faction-location-repository";
import { D1FactionRepository } from "../infrastructure/d1-faction-repository";
import { D1LocationRepository } from "../infrastructure/d1-location-repository";

export class ScenarioService {
    constructor(
        private readonly locationRepository: D1LocationRepository,
        private readonly factionRepository: D1FactionRepository,
		private readonly factionLocationRepository: D1FactionLocationRepository,
    ) {}

    async listEntities() {
        const [locations, factions] = await Promise.all([
			this.locationRepository.listLocations(),
			this.factionRepository.listFactions(),
		]);

		const factionIds = factions.map((faction) => faction.id);

		const relationsByFactionId =
			await this.factionLocationRepository.findRelationsByFactionIds(
				factionIds,
			);

		const locationEntries: WorldEntry[] = locations.map((location) => ({
			uid: `location-${location.id}`,
			id: location.id,
			type: "location",
			name: location.name,
			tagline: location.tagline,
			description: location.description,
			img_key: location.img_key,
			subtype: location.location_type,
		}));

		const factionEntries: WorldEntry[] = factions.map((faction) => ({
			uid: `faction-${faction.id}`,
			id: faction.id,
			type: "faction",
			name: faction.name,
			tagline: faction.tagline,
			description: faction.description,
			img_key: faction.img_key,
			subtype: faction.faction_type,
			location_relations: relationsByFactionId.get(faction.id) ?? [],
		}));

		return [...locationEntries, ...factionEntries].sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	}
}
import { WorldEntry } from "../domain/scenario/scenario";
import { LocationReaderPort, FactionReaderPort, FactionLocationReaderPort } from "./ports/scenario-ports";

export class ScenarioService {
    constructor(
		private readonly locationRepository: LocationReaderPort,
		private readonly factionRepository: FactionReaderPort,
		private readonly factionLocationRepository: FactionLocationReaderPort,
    ) {}

    async listEntities() {
        const [locations, factions] = await Promise.all([
			this.locationRepository.findAll(),
			this.factionRepository.findAll(),
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
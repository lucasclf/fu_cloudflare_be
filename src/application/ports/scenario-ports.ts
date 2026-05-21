import type {
	FactionBase,
	FactionLocationRelation,
} from "../../domain/factions/faction";
import type { Location } from "../../domain/locations/location";

export interface LocationReaderPort {
	listLocations(): Promise<Location[]>;
}

export interface FactionReaderPort {
	listFactions(): Promise<FactionBase[]>;
}

export interface FactionLocationReaderPort {
	findRelationsByFactionIds(
		factionIds: number[],
	): Promise<Map<number, FactionLocationRelation[]>>;
}
import type {
	FactionBase,
	FactionLocationRelation,
} from "../../domain/factions/faction";
import type { Location } from "../../domain/locations/location";

export interface LocationReaderPort {
	findAll(): Promise<Location[]>;
}

export interface FactionReaderPort {
	findAll(): Promise<FactionBase[]>;
}

export interface FactionLocationReaderPort {
	findRelationsByFactionIds(
		factionIds: number[],
	): Promise<Map<number, FactionLocationRelation[]>>;
}
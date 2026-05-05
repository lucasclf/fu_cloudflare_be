import { FactionLocationRelation } from "../factions/faction";

export type WorldEntry = LocationWorldEntry | FactionWorldEntry;

export type WorldEntryType = "location" | "faction";

export interface BaseWorldEntry {
	uid: string;
	id: number;
	type: WorldEntryType;
	name: string;
	tagline: string;
	description: string;
	img_key: string | null;
	subtype: string;
}

export interface LocationWorldEntry extends BaseWorldEntry {
	type: "location";
}

export interface FactionWorldEntry extends BaseWorldEntry {
	type: "faction";
	location_relations: FactionLocationRelation[];
}
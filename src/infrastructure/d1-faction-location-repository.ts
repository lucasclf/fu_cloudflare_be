import { FactionLocationRelation, FactionLocationRelationType } from "../domain/factions/faction";

type FactionLocationRelationRow = {
	faction_id: number;
	location_name: string;
	relation_type: FactionLocationRelationType;
};

export class D1FactionLocationRepository {
    constructor(private readonly db: D1Database) {}
    
    async findRelationsByFactionId(
		factionId: number,
	): Promise<FactionLocationRelation[]> {
		const { results } = await this.db
			.prepare(`
				SELECT
					fl.faction_id,
					l.name AS location_name,
					fl.relation_type
				FROM faction_locations fl
				INNER JOIN locations l
					ON l.id = fl.location_id
				WHERE fl.faction_id = ?
				ORDER BY l.name ASC
			`)
			.bind(factionId)
			.all<FactionLocationRelationRow>();

		return results.map((relation) => ({
			location_name: relation.location_name,
			relation_type: relation.relation_type,
		}));
	}

	async findRelationsByFactionIds(
		factionIds: number[],
	): Promise<Map<number, FactionLocationRelation[]>> {
		if (factionIds.length === 0) {
			return new Map();
		}

		const placeholders = factionIds.map(() => "?").join(",");

		const { results } = await this.db
			.prepare(`
				SELECT
					fl.faction_id,
					l.name AS location_name,
					fl.relation_type
				FROM faction_locations fl
				INNER JOIN locations l
					ON l.id = fl.location_id
				WHERE fl.faction_id IN (${placeholders})
				ORDER BY
					fl.faction_id ASC,
					l.name ASC
			`)
			.bind(...factionIds)
			.all<FactionLocationRelationRow>();

		const relationsByFactionId = new Map<number, FactionLocationRelation[]>();

		for (const relation of results) {
			const currentRelations =
				relationsByFactionId.get(relation.faction_id) ?? [];

			currentRelations.push({
				location_name: relation.location_name,
				relation_type: relation.relation_type,
			});

			relationsByFactionId.set(relation.faction_id, currentRelations);
		}

		return relationsByFactionId;
	}
}
import { FactionLocationRelation, FactionLocationRelationType } from "../../domain/factions/faction";
import { uniqueNumbers, buildInPlaceholders } from "../d1-utils";
import { FactionLocationRelationRow } from "../rows/faction-location";

export class D1FactionLocationRepository {
    constructor(private readonly db: D1Database) {}
    
    async findRelationsByFactionId(
		factionId: number,
	): Promise<FactionLocationRelation[]> {
		const { results } = await this.db
			.prepare(`
				SELECT
					fl.faction_id,
					fl.location_id,
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

		return results.map((row) => this.toFactionLocationRelation(row))
	}

	async findRelationsByFactionIds(
		factionIds: number[],
	): Promise<Map<number, FactionLocationRelation[]>> {
		if (factionIds.length === 0) {
			return new Map();
		}

		const uniqueFactionIds = uniqueNumbers(factionIds);
		const placeholders = buildInPlaceholders(uniqueFactionIds);

		const { results } = await this.db
			.prepare(`
				SELECT
					fl.faction_id,
					fl.location_id,
					l.name AS location_name,
					fl.relation_type
				FROM faction_locations fl
				INNER JOIN locations l
					ON l.id = fl.location_id
				WHERE fl.faction_id IN (${placeholders})
				ORDER BY fl.faction_id ASC, l.name ASC
			`)
			.bind(...uniqueFactionIds)
			.all<FactionLocationRelationRow>();

		const grouped = new Map<number, FactionLocationRelation[]>();

		for (const row of results) {
			const relation = this.toFactionLocationRelation(row);
			const current = grouped.get(row.faction_id) ?? [];

			current.push(relation);
			grouped.set(row.faction_id, current);
		}

		return grouped;
	}

	async deleteByFactionId(factionId: number): Promise<void> {
		await this.db
			.prepare(`DELETE FROM faction_locations WHERE faction_id = ?`)
			.bind(factionId)
			.run();
	}

	async create(factionId: number, locationId: number, relationType: FactionLocationRelationType): Promise<void> {
		await this.db
			.prepare(`INSERT INTO faction_locations (faction_id, location_id, relation_type) VALUES (?, ?, ?)`)
			.bind(factionId, locationId, relationType)
			.run();
	}

	private toFactionLocationRelation(
		row: FactionLocationRelationRow,
	): FactionLocationRelation {
		return {
			location_id: row.location_id,
			location_name: row.location_name,
			relation_type:
				row.relation_type as FactionLocationRelation["relation_type"],
		};
	}
}
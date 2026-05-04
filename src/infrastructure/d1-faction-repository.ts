import { CreateFactionInput, Faction, FactionBase } from "../domain/factions/faction";
import { FactionAlreadyExistsError } from "../domain/factions/faction-errors";

export class D1FactionRepository {
    constructor(private readonly db: D1Database) {}

    async create(input: CreateFactionInput): Promise<void> {
        try {
            const statements = [
                this.db
                    .prepare(`
                        INSERT INTO factions (
                            name,
                            description,
                            tagline,
                            img_key,
                            faction_type
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `)
                    .bind(
                        input.name,
                        input.description,
                        input.tagline,
                        input.img_key ?? null,
                        input.faction_type,
                    ),
            ];

            if (
                input.faction_location_relation !== undefined &&
                input.faction_location_relation !== null &&
                input.faction_location_relation.length > 0
            ) {
                for (const { location_id, relation_type } of input.faction_location_relation) {
                    statements.push(
                        this.db
                            .prepare(`
                                INSERT INTO faction_locations (
                                    location_id,
                                    relation_type,
                                    faction_id
                                )
                                VALUES (
                                    ?,
                                    ?,
                                    (
                                        SELECT id
                                        FROM factions
                                        WHERE name = ?
                                    )
                                )
                            `)
                            .bind(
                                location_id,
                                relation_type,
                                input.name,
                            ),
                    );
                }
            }

            await this.db.batch(statements);
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new FactionAlreadyExistsError(input.name);
            }

            throw error;
        }
    }

    async listFactions(): Promise<FactionBase[]> {
		const { results } = await this.db
			.prepare(`
				SELECT
					id,
					name,
					tagline,
					description,
					img_key,
					faction_type,
					created_at,
					updated_at
				FROM factions
				ORDER BY id ASC
			`)
			.all<FactionBase>();

		return results;
	}

	async getFactionById(id: number): Promise<FactionBase | null> {
		const { results } = await this.db
			.prepare(`
				SELECT
					id,
					name,
					tagline,
					description,
					img_key,
					faction_type,
					created_at,
					updated_at
				FROM factions
				WHERE id = ?
				LIMIT 1
			`)
			.bind(id)
			.all<FactionBase>();

		return results[0] ?? null;
	}
}
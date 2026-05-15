import { Arcana, CreateArcanaInput } from "../domain/jobs/job";
import { ArcanaAlreadyExistsError } from "../domain/jobs/job-errors";

export class D1ArcanaRepository{
    constructor(private readonly db: D1Database){}

    async create(input: CreateArcanaInput): Promise<void> {
        try {
            await this.db
                .prepare(`
            INSERT INTO arcanas (
                name,
                domain,
                merge_effect,
                dismiss_effect,
                special_rule
            )
            VALUES (?, ?, ?, ?, ?)
            `)
                .bind(
                    input.name,
                    input.domain,
                    input.merge_effect,
                    input.dismiss_effect,
                    input.special_rule
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new ArcanaAlreadyExistsError(input.name);
            }

            throw error;
        }
    }

    async findAll(): Promise<Arcana[]> {
        const { results } = await this.db
            .prepare(`
                SELECT
                    id,
                    name,
                    domain,
                    merge_effect,
                    dismiss_effect,
                    special_rule
                FROM arcanas
                ORDER BY name ASC
            `)
            .all<Arcana>();

        return results;
    }

  async findByIds(arcanaIds: number[]): Promise<Map<number, Arcana>> {
    if (arcanaIds.length === 0) {
      return new Map();
    }

    const uniqueArcanaIds = [...new Set(arcanaIds)];
    const placeholders = uniqueArcanaIds.map(() => "?").join(",");

    const { results } = await this.db
      .prepare(`
        SELECT
            id,
            job_id,
            name,
            description,
            is_offensive,
            cost,
            target,
            duration
        FROM job_spells
        WHERE id IN (${placeholders})
        ORDER BY name ASC
      `)
      .bind(...uniqueArcanaIds)
      .all<Arcana>();

    const arcanasById = new Map<number, Arcana>();

    for (const arcana of results) {
      arcanasById.set(arcana.id, {
        ...arcana,
      });
    }

    return arcanasById;
  }
}
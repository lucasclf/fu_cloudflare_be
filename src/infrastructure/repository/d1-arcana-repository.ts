import { Arcana, CreateArcanaInput } from "../../domain/jobs/job";
import { ArcanaAlreadyExistsError } from "../../domain/jobs/job-errors";
import { uniqueNumbers, buildInPlaceholders, mapById } from "../d1-utils";
import { ArcanaEntity } from "../entity/arcana";

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
            .all<ArcanaEntity>();

        return results.map((row) => this.toArcana(row));
    }

    async findByIds(arcanaIds: number[]): Promise<Map<number, Arcana>> {
        if (arcanaIds.length === 0) {
            return new Map();
        }

        const uniqueArcanaIds = uniqueNumbers(arcanaIds);
        const placeholders = buildInPlaceholders(uniqueArcanaIds);

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
                WHERE id IN (${placeholders})
                ORDER BY name ASC
            `)
            .bind(...uniqueArcanaIds)
            .all<ArcanaEntity>();

        const arcanas = results.map((row) => this.toArcana(row));

        return mapById(arcanas);
    }

    private toArcana(row: ArcanaEntity): Arcana {
        return {
            id: row.id,
            name: row.name,
            domain: row.domain,
            merge_effect: row.merge_effect,
            dismiss_effect: row.dismiss_effect,
            special_rule: row.special_rule,
        };
    }
}
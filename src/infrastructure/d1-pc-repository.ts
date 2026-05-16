import { BondTargetSummary, CreatePCInput, PcBase, PcSummary } from "../domain/pc/pc";
import { PcAlreadyExistsError } from "../domain/pc/pc_error";

export class D1PCRepository {
    constructor(private readonly db: D1Database){}

    async create(input: CreatePCInput): Promise<void> {
        try {
            await this.db
                .prepare(`
        INSERT INTO pcs (
            name,
            description,
            pronouns,
            origin,
            identity,
            theme,
            dexterity_die,
            insight_die,
            might_die,
            willpower_die,
            tagline,
            money,
            img_key
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
                .bind(
                    input.name,
                    input.description,
                    input.pronouns,
                    input.origin,
                    input.identity,
                    input.theme,
                    input.dexterity_die,
                    input.insight_die,
                    input.might_die,
                    input.willpower_die,
                    input.tagline,
                    input.money,
                    input.img_key
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new PcAlreadyExistsError(input.name);
            }

            throw error;
        }
    }

    async findAllSummary(): Promise<PcSummary[]> {
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    id,
                    name,
                    tagline,
                    dexterity_die,
                    insight_die,
                    might_die,
                    willpower_die,
                    img_key
                FROM pcs
                ORDER BY name ASC
                `
            ).all<PcSummary>();
        
        return results
    }

    async findById(pcId: string): Promise<PcBase | null> {
        const result = await this.db
            .prepare(
                `
                SELECT
                    id,   
                    name,   
                    description,
                    pronouns,
                    tagline,
                    origin,
                    identity,
                    theme,
                    dexterity_die,
                    insight_die,
                    might_die,
                    willpower_die,
                    money,
                    img_key,
                    created_at,
                    updated_at
                FROM PCS
                WHERE id = ?
                ORDER BY name ASC
                `
            )
            .bind(pcId)
            .first<PcBase>();
        
        return result
    }

    async findBondTargetsByIds(
        pcIds: number[],
    ): Promise<Map<number, BondTargetSummary>> {
        if (pcIds.length === 0) {
            return new Map();
        }

        const uniqueIds = [...new Set(pcIds)];
        const placeholders = uniqueIds.map(() => "?").join(",");

        const { results } = await this.db
            .prepare(`
                SELECT
                    id,
                    name,
                    img_key
                FROM pcs
                WHERE id IN (${placeholders})
            `)
            .bind(...uniqueIds)
            .all<BondTargetSummary>();

        const targetsById = new Map<number, BondTargetSummary>();

        for (const target of results) {
            targetsById.set(target.id, target);
        }

        return targetsById;
    }
}
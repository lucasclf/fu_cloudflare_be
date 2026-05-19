import { CreatePcArcanaRelationInput as PcArcanaRelation } from "../../domain/pc/pc";
import { PcArcanaRelationAlreadyExistsError } from "../../domain/pc/pc_error";

export class D1PCArcanaRepository {
    constructor(private readonly db: D1Database){}

    async create(input: PcArcanaRelation): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO pc_arcanas (
                        pc_id,
                        arcana_id,
                        description
                    ) VALUES (?, ?, ?)
                `)
                .bind(
                    input.pc_id,
                    input.arcana_id,
                    input.description
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new PcArcanaRelationAlreadyExistsError(input.pc_id, input.arcana_id);
            }

            throw error;
        }     
    }

    async findByPcId(pcId: number): Promise<PcArcanaRelation[]> {
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    pc_id,
                    arcana_id,
                    description
                FROM pc_arcanas
                WHERE pc_id = ?
                `
            )
            .bind(pcId)
            .all<PcArcanaRelation>();
        
        return results
    }
}
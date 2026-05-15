import { CreatePcSpellRelationInput as PcSpellRelation } from "../domain/pc/pc";
import { PcSpellRelationAlreadyExistsError } from "../domain/pc/pc_error";

export class D1PCSpellRepository {
    constructor(private readonly db: D1Database){}

    async create(input: PcSpellRelation): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO pc_spells (
                        pc_id,
                        spell_id
                    ) VALUES (?, ?)
                `)
                .bind(
                    input.pc_id,
                    input.spell_id
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new PcSpellRelationAlreadyExistsError(input.pc_id, input.spell_id);
            }

            throw error;
        }  
    }

    async findByPcId(pcId: number): Promise<PcSpellRelation[]> {
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    pc_id,   
                    spell_id
                FROM pc_spells
                WHERE pc_id = ?
                `
            )
            .bind(pcId)
            .all<PcSpellRelation>();
        
        return results
    }
}
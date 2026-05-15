import { PcPowerRelation } from "../domain/pc/pc";
import { PcPowerRelationAlreadyExistsError } from "../domain/pc/pc_error";

export class D1PCPowerRepository {
    constructor(private readonly db: D1Database){}

    async create(input: PcPowerRelation): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO pc_powers (
                        pc_id,
                        power_id,
                        level
                    ) VALUES (?, ?, ?)
                `)
                .bind(
                    input.pc_id,
                    input.power_id,
                    input.level
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new PcPowerRelationAlreadyExistsError(input.pc_id, input.power_id);
            }

            throw error;
        }  
    }

    async findByPcId(pcId: number): Promise<PcPowerRelation[]> {
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    pc_id,   
                    power_id,   
                    level
                FROM pc_powers
                WHERE pc_id = ?
                `
            )
            .bind(pcId)
            .all<PcPowerRelation>();
        
        return results
    }
}
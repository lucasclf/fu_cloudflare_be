import { CreatePcBondInput, PcBond } from "../domain/pc/pc";
import { PcBondAlreadyExistsError } from "../domain/pc/pc_error";

export class D1PCBondRepository {
    constructor(private readonly db: D1Database){}

    async create(input: CreatePcBondInput): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO pc_bonds (
                        pc_id,
                        target_type,
                        target_id,
                        target_name,
                        admiration_axis,
                        loyalty_axis,
                        affection_axis,
                        description
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `)
                .bind(
                    input.pc_id,
                    input.target_type,
                    input.target_id,
                    input.target_name,
                    input.admiration_axis,
                    input.loyalty_axis,
                    input.affection_axis,
                    input.description,
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new PcBondAlreadyExistsError(input.pc_id, input.target_id, input.target_type);
            }

            throw error;
        }     
    }

    async findByPcId(pcId: number): Promise<PcBond[]> {
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    pc_id,
                    target_type,
                    target_id,
                    target_name,
                    admiration_axis,
                    loyalty_axis,
                    affection_axis,
                    description
                FROM pc_bonds
                WHERE pc_id = ?
                `
            )
            .bind(pcId)
            .all<PcBond>();
        
        return results
    }
}
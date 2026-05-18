import { PcBondInput, PcBond } from "../domain/pc/pc";
import { PcBondAlreadyExistsError } from "../domain/pc/pc_error";

type PcBondRow = {
	id: number;
	pc_id: number;
	target_type: string;
	target_id: number | null;
	target_name: string | null;
	admiration_axis: string | null;
	loyalty_axis: string | null;
	affection_axis: string | null;
	description: string | null;
	created_at?: string;
	updated_at?: string | null;
    img_key: string | null;
};

export class D1PCBondRepository {
    constructor(private readonly db: D1Database){}

    async create(input: PcBondInput): Promise<void> {
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
            .all<PcBondRow>();
        
        return results.map((row) => this.toPcBond(row));
    }

    private toPcBond(row: PcBondRow): PcBond {
        return {
            id: row.id,
            pc_id: row.pc_id,
            target_type: row.target_type as PcBond["target_type"],
            target_id: row.target_id,
            target_name: row.target_name,
            admiration_axis: row.admiration_axis as PcBond["admiration_axis"],
            loyalty_axis: row.loyalty_axis as PcBond["loyalty_axis"],
            affection_axis: row.affection_axis as PcBond["affection_axis"],
            description: row.description,
            img_key: row.img_key,
        };
    }
}
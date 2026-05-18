import { PcJobRelation } from "../domain/pc/pc";
import { PcJobRelationAlreadyExistsError } from "../domain/pc/pc_error";

type PcJobRelationRow = {
	pc_id: number;
	job_id: number;
	level: number;
};

export class D1PCJobRepository {
    constructor(private readonly db: D1Database){}

    async create(input: PcJobRelation): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO pc_jobs (
                        pc_id,
                        job_id,
                        level
                    ) VALUES (?, ?, ?)
                `)
                .bind(
                    input.pc_id,
                    input.job_id,
                    input.level
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new PcJobRelationAlreadyExistsError(input.pc_id, input.job_id);
            }

            throw error;
        }     
    }
    
    async findByPcId(pcId: number): Promise<PcJobRelation[]> {
        const { results } = await this.db
            .prepare(`
                SELECT
                    pc_id,
                    job_id,
                    level
                FROM pc_jobs
                WHERE pc_id = ?
                ORDER BY job_id ASC
            `)
            .bind(pcId)
            .all<PcJobRelationRow>();

        return results;
    }
}
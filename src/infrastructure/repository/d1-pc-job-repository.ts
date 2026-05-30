import { PcJobRelation } from "../../domain/pc/pc";
import { PcJobRelationAlreadyExistsError } from "../../domain/pc/pc_error";
import { toBoolean } from "../d1-utils";
import { PcJobRelationRow } from "../rows/pc";

export class D1PCJobRepository {
    constructor(private readonly db: D1Database){}

    async create(input: PcJobRelation): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO pc_jobs (
                        pc_id,
                        job_id,
                        level,
                        ignore_hp_bonus,
                        ignore_mp_bonus
                    ) VALUES (?, ?, ?, ?, ?)
                `)
                .bind(
                    input.pc_id,
                    input.job_id,
                    input.level,
                    input.ignore_hp_bonus,
                    input.ignore_mp_bonus
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
                    level,
                    ignore_hp_bonus,
                    ignore_mp_bonus
                FROM pc_jobs
                WHERE pc_id = ?
                ORDER BY job_id ASC
            `)
            .bind(pcId)
            .all<PcJobRelationRow>();
        
        const PcJobRelations: PcJobRelation[] = results.map((row) => this.toRelation(row));

        return PcJobRelations;
    }

    private toRelation(row: PcJobRelationRow): PcJobRelation {
        return {
            ...row,
            ignore_hp_bonus: toBoolean(row.ignore_hp_bonus),
            ignore_mp_bonus: toBoolean(row.ignore_mp_bonus),
        };
      }
}
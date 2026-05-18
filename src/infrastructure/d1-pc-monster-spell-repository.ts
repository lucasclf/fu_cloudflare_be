import { CreatePcMonsterSpellRelationInput as PcMonsterSpellRelation } from "../domain/pc/pc";
import { PcMonsterSpellRelationAlreadyExistsError } from "../domain/pc/pc_error";

type PcMonsterSpellRelationRow = {
	pc_id: number;
	monster_action_id: number;
};

export class D1PCMonsterSpellRepository {
    constructor(private readonly db: D1Database){}

    async create(input: PcMonsterSpellRelation): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO pc_monster_spells (
                        pc_id,
                        monster_action_id
                    ) VALUES (?, ?)
                `)
                .bind(
                    input.pc_id,
                    input.monster_action_id
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new PcMonsterSpellRelationAlreadyExistsError(input.pc_id, input.monster_action_id);
            }

            throw error;
        }  
    }

    async findByPcId(pcId: number): Promise<PcMonsterSpellRelation[]> {
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    pc_id,
                    monster_action_id
                FROM pc_monster_spells
                WHERE pc_id = ?
                `
            )
            .bind(pcId)
            .all<PcMonsterSpellRelationRow>();
        
        return results
    }
}
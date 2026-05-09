import { CreateNpcEquipmentInput, NpcEquipmentRelation } from "../domain/npc/npc";
import { EquipmentAlreadyExistsError } from "../domain/npc/npc_error";

export class D1NpcEquipmentRepository {
    constructor(private readonly db: D1Database){}

    async create(input: CreateNpcEquipmentInput) {
        try {
            await this.db
                .prepare(`
                    INSERT INTO npc_equipment (
                        npc_id,
                        item_id,
                        slot
                    ) VALUES (?, ?, ?)
                `)
                .bind(
                    input.npc_id,
                    input.item_id,
                    input.slot
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new EquipmentAlreadyExistsError(input.npc_id, input.item_id);
            }

            throw error;
        }        
    }

    async findByNpcsIds(npcsIds: number[]): Promise<Map<number, NpcEquipmentRelation[]>> {
            if (npcsIds.length === 0) {
                return new Map();
            }
    
            const placeholders = npcsIds.map(() => "?").join(",");
    
            const { results } = await this.db
                .prepare(`
                SELECT
                    npc_id,
                    item_id,
                    slot
                FROM npc_equipment
                WHERE npc_id IN (${placeholders})
                ORDER BY npc_id ASC
                `)
                .bind(...npcsIds)
                .all<NpcEquipmentRelation>();
    
            const grouped = new Map<number, NpcEquipmentRelation[]>();
    
            for (const equipment of results) {
                const current = grouped.get(equipment.npc_id) ?? [];
                current.push(equipment);
                grouped.set(equipment.npc_id, current);
            }
    
            return grouped;
        }
}
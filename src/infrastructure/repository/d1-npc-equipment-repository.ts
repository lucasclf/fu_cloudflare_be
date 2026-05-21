import { CreateNpcEquipmentInput, NpcEquipmentRelation } from "../../domain/npc/npc";
import { EquipmentAlreadyExistsError } from "../../domain/npc/npc_error";
import { uniqueNumbers, buildInPlaceholders, groupByNumberKey } from "../d1-utils";
import { NpcEquipmentRelationRow } from "../rows/npc";

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

    async findByNpcsIds(
        npcIds: number[],
    ): Promise<Map<number, NpcEquipmentRelation[]>> {
        if (npcIds.length === 0) {
            return new Map();
        }

        const uniqueNpcIds = uniqueNumbers(npcIds);
        const placeholders = buildInPlaceholders(uniqueNpcIds);

        const { results } = await this.db
            .prepare(`
                SELECT
                    npc_id,
                    item_id,
                    slot
                FROM npc_equipment
                WHERE npc_id IN (${placeholders})
                ORDER BY npc_id ASC, slot ASC
            `)
            .bind(...uniqueNpcIds)
            .all<NpcEquipmentRelationRow>();

        const equipments = results.map((row) =>
            this.toNpcEquipmentRelation(row),
        );

        return groupByNumberKey(equipments, (equipment) => equipment.npc_id);
    }

    private toNpcEquipmentRelation(
        row: NpcEquipmentRelationRow,
    ): NpcEquipmentRelation {
        return {
            npc_id: row.npc_id,
            item_id: row.item_id,
            slot: row.slot as NpcEquipmentRelation["slot"],
        };
    }
}
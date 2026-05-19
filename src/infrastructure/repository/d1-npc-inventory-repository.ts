import { CreateNpcInventoryInput, NpcInventoryRelation } from "../../domain/npc/npc";
import { InventoryAlreadyExistsError } from "../../domain/npc/npc_error";
import { uniqueNumbers, buildInPlaceholders, groupByNumberKey } from "../d1-utils";
import { NpcInventoryRelationEntity } from "../entity/npc";

export class D1NpcInventoryRepository {
    constructor(private readonly db: D1Database){}

    async create(input: CreateNpcInventoryInput): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO npc_inventory (
                        npc_id,
                        item_id,
                        relation_type,
                        quantity
                    ) VALUES (?, ?, ?, ?)
                `)
                .bind(
                    input.npc_id,
                    input.item_id,
                    input.relation_type,
                    input.quantity
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new InventoryAlreadyExistsError(input.npc_id, input.item_id);
            }

            throw error;
        }        
    }

    async findByNpcsIds(
        npcIds: number[],
    ): Promise<Map<number, NpcInventoryRelation[]>> {
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
                    relation_type,
                    quantity
                FROM npc_inventory
                WHERE npc_id IN (${placeholders})
                ORDER BY npc_id ASC, item_id ASC
            `)
            .bind(...uniqueNpcIds)
            .all<NpcInventoryRelationEntity>();

        const inventories = results.map((row) =>
            this.toNpcInventoryRelation(row),
        );

        return groupByNumberKey(inventories, (inventory) => inventory.npc_id);
    }

    private toNpcInventoryRelation(
        row: NpcInventoryRelationEntity,
    ): NpcInventoryRelation {
        return {
            npc_id: row.npc_id,
            item_id: row.item_id,
            relation_type: row.relation_type as NpcInventoryRelation["relation_type"],
            quantity: row.quantity,
        };
    }
}
import { CreateNpcInventoryInput, NpcInventory } from "../domain/npc/npc";
import { InventoryAlreadyExistsError } from "../domain/npc/npc_error";

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

    async findByNpcsIds(npcsIds: number[]): Promise<Map<number, NpcInventory[]>> {
        if (npcsIds.length === 0) {
            return new Map();
        }

        const placeholders = npcsIds.map(() => "?").join(",");

        const { results } = await this.db
            .prepare(`
            SELECT
                npc_id,
                item_id,
                relation_type,
                quantity
            FROM npc_inventory
            WHERE npc_id IN (${placeholders})
            ORDER BY npc_id ASC
            `)
            .bind(...npcsIds)
            .all<NpcInventory>();

        const grouped = new Map<number, NpcInventory[]>();

        for (const inventory of results) {
            const current = grouped.get(inventory.npc_id) ?? [];
            current.push(inventory);
            grouped.set(inventory.npc_id, current);
        }

        return grouped;
    }
}
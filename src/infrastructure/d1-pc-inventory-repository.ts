import { CreatePcInventoryInput as PcInventory } from "../domain/pc/pc";
import { PcInventoryAlreadyExistsError } from "../domain/pc/pc_error";

type PcInventoryRelationRow = {
	pc_id: number;
	item_id: number;
	quantity: number;
};

export class D1PCInventoryRepository {
    constructor(private readonly db: D1Database){}

    async create(input: PcInventory): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO pc_inventories (
                        pc_id,
                        item_id,
                        quantity
                    ) VALUES (?, ?, ?)
                `)
                .bind(
                    input.pc_id,
                    input.item_id,
                    input.quantity
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new PcInventoryAlreadyExistsError(input.pc_id, input.item_id);
            }

            throw error;
        }     
    }

    async findByPcId(pcId: number): Promise<PcInventory[]> {
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    pc_id,
                    item_id,
                    quantity
                FROM pc_inventories
                WHERE pc_id = ?
                `
            )
            .bind(pcId)
            .all<PcInventoryRelationRow>();
        
        return results
    }
}
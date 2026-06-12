import { CreateNpcEquipmentInput } from "../../domain/npc/npc";
import { NpcEquipmentAlreadyExistsError } from "../../domain/npc/npc_error";
import { buildInPlaceholders, uniqueNumbers } from "../d1-utils";
import { NpcEquipmentRow } from "../rows/npc";

export class D1NpcEquipmentRepository {
    constructor(private readonly db: D1Database){}

    async create(input: CreateNpcEquipmentInput): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO npc_equipment (
                        npc_id,
                        main_hand,
                        off_hand,
                        armor,
                        accessory
                    ) VALUES (?, ?, ?, ?, ?)
                `)
                .bind(
                    input.npc_id,
                    input.main_hand,
                    input.off_hand,
                    input.armor,
                    input.accessory
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new NpcEquipmentAlreadyExistsError(input.npc_id);
            }

            throw error;
        }
    }

    async findByNpcsIds(
        npcIds: number[],
    ): Promise<Map<number, CreateNpcEquipmentInput>> {
        if (npcIds.length === 0) {
            return new Map();
        }

        const uniqueNpcIds = uniqueNumbers(npcIds);
        const placeholders = buildInPlaceholders(uniqueNpcIds);

        const { results } = await this.db
            .prepare(`
                SELECT
                    npc_id,
                    main_hand,
                    off_hand,
                    armor,
                    accessory
                FROM npc_equipment
                WHERE npc_id IN (${placeholders})
            `)
            .bind(...uniqueNpcIds)
            .all<NpcEquipmentRow>();

        return new Map(results.map((row) => [row.npc_id, row]));
    }
}

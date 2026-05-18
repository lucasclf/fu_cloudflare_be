import { CreatePcEquipmentInput } from "../domain/pc/pc";
import { PcEquipmentAlreadyExistsError } from "../domain/pc/pc_error";

type PcEquipmentRelationRow = {
	pc_id: number;
	main_hand: number | null;
	off_hand: number | null;
	armor: number | null;
	accessory: number | null;
};

export class D1PCEquipmentRepository {
    constructor(private readonly db: D1Database){}

    async create(input: CreatePcEquipmentInput): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO pc_equipments (
                        pc_id,
                        main_hand,
                        off_hand,
                        armor,
                        accessory
                    ) VALUES (?, ?, ?, ?, ?)
                `)
                .bind(
                    input.pc_id,
                    input.main_hand,
                    input.off_hand,
                    input.armor,
                    input.accessory
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new PcEquipmentAlreadyExistsError(input.pc_id);
            }

            throw error;
        }     
    }

    async findByPcId(pcId: number): Promise<CreatePcEquipmentInput | null> {
        const result = await this.db
            .prepare(
                `
                SELECT
                    pc_id,
                    main_hand,
                    off_hand,
                    armor,
                    accessory
                FROM pc_equipments
                WHERE pc_id = ?
                `
            )
            .bind(pcId)
            .first<PcEquipmentRelationRow>();
        
        return result
    }
}
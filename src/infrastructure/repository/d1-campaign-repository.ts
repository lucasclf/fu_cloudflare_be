import type { Campaign, CreateCampaignInput, UpdateCampaignInput, UpdateCampaignNotesInput } from "../../domain/campaigns/campaign";
import { CampaignAlreadyExistsError } from "../../domain/campaigns/campaign-errors";
import type { CampaignRepositoryPort } from "../../application/ports/campaign-ports";

export class D1CampaignRepository implements CampaignRepositoryPort {
    constructor(private readonly db: D1Database) {}

    async findAll(): Promise<Campaign[]> {
        const { results } = await this.db
            .prepare("SELECT id, name, description, img_key, status, master_notes, created_at, updated_at FROM campaigns ORDER BY name ASC")
            .all<Campaign>();
        return results;
    }

    async findById(id: string): Promise<Campaign | null> {
        return await this.db
            .prepare("SELECT id, name, description, img_key, status, master_notes, created_at, updated_at FROM campaigns WHERE id = ? LIMIT 1")
            .bind(id)
            .first<Campaign>();
    }

    async create(input: CreateCampaignInput): Promise<number> {
        try {
            const result = await this.db
                .prepare("INSERT INTO campaigns (name, description, img_key) VALUES (?, ?, ?)")
                .bind(input.name, input.description, input.img_key)
                .run();
            return result.meta.last_row_id;
        } catch (error) {
            if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
                throw new CampaignAlreadyExistsError(input.name);
            }
            throw error;
        }
    }

    async update(id: string, input: UpdateCampaignInput): Promise<void> {
        try {
            await this.db
                .prepare("UPDATE campaigns SET name = ?, description = ?, img_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
                .bind(input.name, input.description, input.img_key, id)
                .run();
        } catch (error) {
            if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
                throw new CampaignAlreadyExistsError(input.name);
            }
            throw error;
        }
    }

    async updateNotes(id: string, input: UpdateCampaignNotesInput): Promise<void> {
        await this.db
            .prepare("UPDATE campaigns SET master_notes = ?, status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?")
            .bind(input.master_notes, input.status ?? null, id)
            .run();
    }

    async delete(id: string): Promise<void> {
        await this.db.prepare("DELETE FROM campaigns WHERE id = ?").bind(id).run();
    }
}

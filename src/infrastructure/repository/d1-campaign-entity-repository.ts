import type { CampaignEntity, CampaignPc, LinkEntityInput, LinkPcInput, UnlinkEntityInput, UpdateCampaignPcInput } from "../../domain/campaigns/campaign-entity";
import { CampaignEntityAlreadyLinkedError, CampaignPcAlreadyLinkedError } from "../../domain/campaigns/campaign-entity-errors";
import type { CampaignEntityRepositoryPort, CampaignPcRepositoryPort } from "../../application/ports/campaign-entity-ports";
import { fromBoolean, toBoolean } from "../d1-utils";
import type { CampaignEntityRow, CampaignPcRow } from "../rows/campaign";

export class D1CampaignEntityRepository implements CampaignEntityRepositoryPort {
    constructor(private readonly db: D1Database) {}

    async findByCampaignId(campaignId: number): Promise<CampaignEntity[]> {
        const { results } = await this.db
            .prepare("SELECT id, campaign_id, entity_type, entity_id, visible_to_players, created_at FROM campaign_entities WHERE campaign_id = ? ORDER BY entity_type, entity_id")
            .bind(campaignId)
            .all<CampaignEntityRow>();
        return results.map((r) => ({ ...r, entity_type: r.entity_type as CampaignEntity["entity_type"], visible_to_players: toBoolean(r.visible_to_players) }));
    }

    async link(input: LinkEntityInput): Promise<void> {
        try {
            await this.db
                .prepare("INSERT INTO campaign_entities (campaign_id, entity_type, entity_id, visible_to_players) VALUES (?, ?, ?, ?)")
                .bind(input.campaign_id, input.entity_type, input.entity_id, fromBoolean(input.visible_to_players))
                .run();
        } catch (error) {
            if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
                throw new CampaignEntityAlreadyLinkedError(input.entity_type, input.entity_id, input.campaign_id);
            }
            throw error;
        }
    }

    async unlink(input: UnlinkEntityInput): Promise<void> {
        await this.db
            .prepare("DELETE FROM campaign_entities WHERE campaign_id = ? AND entity_type = ? AND entity_id = ?")
            .bind(input.campaign_id, input.entity_type, input.entity_id)
            .run();
    }

    async updateVisibility(campaignId: number, entityType: string, entityId: number, visible: boolean): Promise<void> {
        await this.db
            .prepare("UPDATE campaign_entities SET visible_to_players = ? WHERE campaign_id = ? AND entity_type = ? AND entity_id = ?")
            .bind(fromBoolean(visible), campaignId, entityType, entityId)
            .run();
    }
}

export class D1CampaignPcRepository implements CampaignPcRepositoryPort {
    constructor(private readonly db: D1Database) {}

    async findByCampaignId(campaignId: number): Promise<CampaignPc[]> {
        const { results } = await this.db
            .prepare("SELECT campaign_id, pc_id, visible_to_players, created_at FROM campaign_pcs WHERE campaign_id = ? ORDER BY pc_id")
            .bind(campaignId)
            .all<CampaignPcRow>();
        return results.map((r) => ({ ...r, visible_to_players: toBoolean(r.visible_to_players) }));
    }

    async findByCampaignAndPc(campaignId: number, pcId: number): Promise<CampaignPc | null> {
        const result = await this.db
            .prepare("SELECT campaign_id, pc_id, visible_to_players, created_at FROM campaign_pcs WHERE campaign_id = ? AND pc_id = ? LIMIT 1")
            .bind(campaignId, pcId)
            .first<CampaignPcRow>();
        return result ? { ...result, visible_to_players: toBoolean(result.visible_to_players) } : null;
    }

    async link(input: LinkPcInput): Promise<void> {
        try {
            await this.db
                .prepare("INSERT INTO campaign_pcs (campaign_id, pc_id, visible_to_players) VALUES (?, ?, ?)")
                .bind(input.campaign_id, input.pc_id, fromBoolean(input.visible_to_players))
                .run();
        } catch (error) {
            if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
                throw new CampaignPcAlreadyLinkedError(input.pc_id, input.campaign_id);
            }
            throw error;
        }
    }

    async unlink(campaignId: number, pcId: number): Promise<void> {
        await this.db
            .prepare("DELETE FROM campaign_pcs WHERE campaign_id = ? AND pc_id = ?")
            .bind(campaignId, pcId)
            .run();
    }

    async update(campaignId: number, pcId: number, input: UpdateCampaignPcInput): Promise<void> {
        await this.db
            .prepare("UPDATE campaign_pcs SET visible_to_players = ? WHERE campaign_id = ? AND pc_id = ?")
            .bind(fromBoolean(input.visible_to_players), campaignId, pcId)
            .run();
    }
}

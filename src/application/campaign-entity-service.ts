import type { CampaignEntity, CampaignPc, EntityType, LinkEntityInput, LinkPcInput, UnlinkEntityInput, UpdateCampaignPcInput } from "../domain/campaigns/campaign-entity";
import { CampaignNotFoundError } from "../domain/campaigns/campaign-errors";
import type { CampaignReaderPort } from "./ports/campaign-ports";
import type { CampaignEntityRepositoryPort, CampaignPcRepositoryPort } from "./ports/campaign-entity-ports";

export class CampaignEntityService {
    constructor(
        private readonly campaignRepo: CampaignReaderPort,
        private readonly entityRepo: CampaignEntityRepositoryPort,
        private readonly pcRepo: CampaignPcRepositoryPort,
    ) {}

    // ── Entidades genéricas ──────────────────────────────────────────────────

    async listEntities(campaignId: number): Promise<CampaignEntity[]> {
        await this.assertCampaignExists(campaignId);
        return await this.entityRepo.findByCampaignId(campaignId);
    }

    async linkEntity(input: LinkEntityInput): Promise<void> {
        await this.assertCampaignExists(input.campaign_id);
        await this.entityRepo.link(input);
    }

    async unlinkEntity(campaignId: number, entityType: EntityType, entityId: number): Promise<void> {
        await this.assertCampaignExists(campaignId);
        await this.entityRepo.unlink({ campaign_id: campaignId, entity_type: entityType, entity_id: entityId });
    }

    async getEntity(campaignId: number, entityType: EntityType, entityId: number): Promise<CampaignEntity | null> {
        return await this.entityRepo.findByEntity(campaignId, entityType, entityId);
    }

    async updateEntityVisibility(campaignId: number, entityType: EntityType, entityId: number, visible: boolean): Promise<void> {
        await this.assertCampaignExists(campaignId);
        await this.entityRepo.updateVisibility(campaignId, entityType, entityId, visible);
    }

    // ── PCs ──────────────────────────────────────────────────────────────────

    async listPcs(campaignId: number): Promise<CampaignPc[]> {
        await this.assertCampaignExists(campaignId);
        return await this.pcRepo.findByCampaignId(campaignId);
    }

    async getCampaignPc(campaignId: number, pcId: number): Promise<CampaignPc | null> {
        return await this.pcRepo.findByCampaignAndPc(campaignId, pcId);
    }

    async linkPc(input: LinkPcInput): Promise<void> {
        await this.assertCampaignExists(input.campaign_id);
        await this.pcRepo.link(input);
    }

    async unlinkPc(campaignId: number, pcId: number): Promise<void> {
        await this.assertCampaignExists(campaignId);
        await this.pcRepo.unlink(campaignId, pcId);
    }

    async updateCampaignPc(campaignId: number, pcId: number, input: UpdateCampaignPcInput): Promise<void> {
        await this.assertCampaignExists(campaignId);
        await this.pcRepo.update(campaignId, pcId, input);
    }

    private async assertCampaignExists(campaignId: number): Promise<void> {
        const c = await this.campaignRepo.findById(String(campaignId));
        if (!c) throw new CampaignNotFoundError(campaignId);
    }
}

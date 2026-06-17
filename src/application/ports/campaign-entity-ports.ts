import type {
    CampaignEntity, CampaignPc,
    LinkEntityInput, LinkPcInput,
    UnlinkEntityInput, UpdateCampaignPcInput,
} from "../../domain/campaigns/campaign-entity";

export interface CampaignEntityRepositoryPort {
    findByCampaignId(campaignId: number): Promise<CampaignEntity[]>;
    findByEntity(campaignId: number, entityType: string, entityId: number): Promise<CampaignEntity | null>;
    link(input: LinkEntityInput): Promise<void>;
    unlink(input: UnlinkEntityInput): Promise<void>;
    updateVisibility(campaignId: number, entityType: string, entityId: number, visible: boolean): Promise<void>;
}

export interface CampaignPcRepositoryPort {
    findByCampaignId(campaignId: number): Promise<CampaignPc[]>;
    findByCampaignAndPc(campaignId: number, pcId: number): Promise<CampaignPc | null>;
    link(input: LinkPcInput): Promise<void>;
    unlink(campaignId: number, pcId: number): Promise<void>;
    update(campaignId: number, pcId: number, input: UpdateCampaignPcInput): Promise<void>;
}

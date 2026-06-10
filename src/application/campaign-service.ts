import type { Campaign, CreateCampaignInput, UpdateCampaignInput, UpdateCampaignNotesInput } from "../domain/campaigns/campaign";
import { CampaignNotFoundError } from "../domain/campaigns/campaign-errors";
import type { CampaignRepositoryPort } from "./ports/campaign-ports";

export class CampaignService {
    constructor(private readonly repo: CampaignRepositoryPort) {}

    async listCampaigns(): Promise<Campaign[]> {
        return await this.repo.findAll();
    }

    async getCampaignById(id: string): Promise<Campaign> {
        const campaign = await this.repo.findById(id);
        if (!campaign) throw new CampaignNotFoundError(id);
        return campaign;
    }

    async createCampaign(input: CreateCampaignInput): Promise<number> {
        return await this.repo.create(input);
    }

    async updateCampaign(id: string, input: UpdateCampaignInput): Promise<void> {
        await this.getCampaignById(id);
        await this.repo.update(id, input);
    }

    async updateCampaignNotes(id: string, input: UpdateCampaignNotesInput): Promise<void> {
        await this.getCampaignById(id);
        await this.repo.updateNotes(id, input);
    }

    async deleteCampaign(id: string): Promise<void> {
        await this.getCampaignById(id);
        await this.repo.delete(id);
    }
}

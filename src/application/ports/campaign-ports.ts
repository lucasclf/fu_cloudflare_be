import type { Campaign, CreateCampaignInput, UpdateCampaignInput, UpdateCampaignNotesInput } from "../../domain/campaigns/campaign";

export interface CampaignReaderPort {
    findAll(): Promise<Campaign[]>;
    findById(id: string): Promise<Campaign | null>;
}

export interface CampaignWriterPort {
    create(input: CreateCampaignInput): Promise<number>;
    update(id: string, input: UpdateCampaignInput): Promise<void>;
    updateNotes(id: string, input: UpdateCampaignNotesInput): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface CampaignRepositoryPort extends CampaignReaderPort, CampaignWriterPort {}

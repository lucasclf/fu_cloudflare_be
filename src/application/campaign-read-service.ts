import type { FactionBase } from "../domain/factions/faction";
import type { Item } from "../domain/items/item";
import type { Arcana, Job, JobPowerWithJob } from "../domain/jobs/job";
import type { Location } from "../domain/locations/location";
import type { MonsterSummary } from "../domain/monsters/monster";
import type { NpcSummary } from "../domain/npc/npc";
import type { PcSummary } from "../domain/pc/pc";
import type { Session } from "../domain/sessions/session";
import type { JobSpellWithJob } from "../domain/spells/spells";
import { CampaignNotFoundError } from "../domain/campaigns/campaign-errors";
import type { CampaignReaderPort } from "./ports/campaign-ports";
import type { CampaignHomeStats, CampaignReadRepositoryPort } from "./ports/campaign-read-ports";

export class CampaignReadService {
    constructor(
        private readonly campaignRepo: CampaignReaderPort,
        private readonly readRepo: CampaignReadRepositoryPort,
    ) {}

    async listSessions(campaignId: number, role: string): Promise<Session[]> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.findSessions(campaignId, this.isPlayer(role));
    }

    async listNpcs(campaignId: number, role: string): Promise<NpcSummary[]> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.findNpcSummaries(campaignId, this.isPlayer(role));
    }

    async listLocations(campaignId: number, role: string): Promise<Location[]> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.findLocations(campaignId, this.isPlayer(role));
    }

    async listFactions(campaignId: number, role: string): Promise<FactionBase[]> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.findFactions(campaignId, this.isPlayer(role));
    }

    async listMonsters(campaignId: number, role: string): Promise<MonsterSummary[]> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.findMonsterSummaries(campaignId, this.isPlayer(role));
    }

    async listItems(campaignId: number, role: string): Promise<Item[]> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.findItems(campaignId, this.isPlayer(role));
    }

    async listSpells(campaignId: number, role: string): Promise<JobSpellWithJob[]> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.findSpells(campaignId, this.isPlayer(role));
    }

    async listJobs(campaignId: number, role: string): Promise<Job[]> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.findJobs(campaignId, this.isPlayer(role));
    }

    async listPowers(campaignId: number, role: string): Promise<JobPowerWithJob[]> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.findPowers(campaignId, this.isPlayer(role));
    }

    async listArcanas(campaignId: number, role: string): Promise<Arcana[]> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.findArcanas(campaignId, this.isPlayer(role));
    }

    async listPcs(campaignId: number, role: string, userId?: number): Promise<PcSummary[]> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.findPcSummaries(campaignId, this.isPlayer(role), userId);
    }

    async isPcInCampaign(campaignId: number, pcId: number, role: string, userId?: number): Promise<boolean> {
        await this.assertCampaignExists(campaignId);
        return await this.readRepo.isPcInCampaign(campaignId, pcId, this.isPlayer(role), userId);
    }

    async getHomeStats(campaignId: number): Promise<CampaignHomeStats> {
        return await this.readRepo.findHomeStats(campaignId);
    }

    private isPlayer(role: string): boolean {
        return role === "player";
    }

    private async assertCampaignExists(campaignId: number): Promise<void> {
        const c = await this.campaignRepo.findById(String(campaignId));
        if (!c) throw new CampaignNotFoundError(campaignId);
    }
}

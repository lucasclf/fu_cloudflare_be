import type { Arcana, Job, JobPowerWithJob } from "../../domain/jobs/job";
import type { FactionBase } from "../../domain/factions/faction";
import type { Item } from "../../domain/items/item";
import type { Location } from "../../domain/locations/location";
import type { MonsterSummary } from "../../domain/monsters/monster";
import type { NpcSummary } from "../../domain/npc/npc";
import type { PcSummary } from "../../domain/pc/pc";
import type { Session } from "../../domain/sessions/session";
import type { JobSpellWithJob } from "../../domain/spells/spells";

export interface CampaignHomeStats {
    memberCount: number;
    sessionCount: number;
    npcCount: number;
    locationCount: number;
    factionCount: number;
    monsterCount: number;
    pcCount: number;
}

export interface CampaignReadRepositoryPort {
    findSessions(campaignId: number, visibleOnly: boolean): Promise<Session[]>;
    findNpcSummaries(campaignId: number, visibleOnly: boolean): Promise<NpcSummary[]>;
    findLocations(campaignId: number, visibleOnly: boolean): Promise<Location[]>;
    findFactions(campaignId: number, visibleOnly: boolean): Promise<FactionBase[]>;
    findMonsterSummaries(campaignId: number, visibleOnly: boolean): Promise<MonsterSummary[]>;
    findItems(campaignId: number, visibleOnly: boolean): Promise<Item[]>;
    findSpells(campaignId: number, visibleOnly: boolean): Promise<JobSpellWithJob[]>;
    findJobs(campaignId: number, visibleOnly: boolean): Promise<Job[]>;
    findPowers(campaignId: number, visibleOnly: boolean): Promise<JobPowerWithJob[]>;
    findArcanas(campaignId: number, visibleOnly: boolean): Promise<Arcana[]>;
    findPcSummaries(campaignId: number, visibleOnly: boolean, userId?: number): Promise<PcSummary[]>;
    isPcInCampaign(campaignId: number, pcId: number, visibleOnly: boolean, userId?: number): Promise<boolean>;
    findHomeStats(campaignId: number): Promise<CampaignHomeStats>;
}

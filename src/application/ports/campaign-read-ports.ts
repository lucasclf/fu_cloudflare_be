import type { FactionBase } from "../../domain/factions/faction";
import type { Location } from "../../domain/locations/location";
import type { MonsterSummary } from "../../domain/monsters/monster";
import type { NpcSummary } from "../../domain/npc/npc";
import type { PcSummary } from "../../domain/pc/pc";
import type { Session } from "../../domain/sessions/session";

export interface CampaignReadRepositoryPort {
    findSessions(campaignId: number, visibleOnly: boolean): Promise<Session[]>;
    findNpcSummaries(campaignId: number, visibleOnly: boolean): Promise<NpcSummary[]>;
    findLocations(campaignId: number, visibleOnly: boolean): Promise<Location[]>;
    findFactions(campaignId: number, visibleOnly: boolean): Promise<FactionBase[]>;
    findMonsterSummaries(campaignId: number, visibleOnly: boolean): Promise<MonsterSummary[]>;
    findPcSummaries(campaignId: number, visibleOnly: boolean, userId?: number): Promise<PcSummary[]>;
    isPcInCampaign(campaignId: number, pcId: number, visibleOnly: boolean, userId?: number): Promise<boolean>;
}

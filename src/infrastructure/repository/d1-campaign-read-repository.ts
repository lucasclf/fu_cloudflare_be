import type { FactionBase } from "../../domain/factions/faction";
import type { Location } from "../../domain/locations/location";
import type { MonsterSummary } from "../../domain/monsters/monster";
import type { NpcSummary } from "../../domain/npc/npc";
import type { PcSummary } from "../../domain/pc/pc";
import type { Session } from "../../domain/sessions/session";
import type { CampaignReadRepositoryPort } from "../../application/ports/campaign-read-ports";
import type { D1Boolean } from "../d1-utils";
import { toBoolean } from "../d1-utils";
import type { NpcSummaryRow } from "../rows/npc";

// Filtro SQL: bind 1 = filtra visible_to_players=1; bind 0 = sem filtro
// Para PCs: o dono (pcs.user_id) sempre vê o próprio PC, independente do flag
const VIS = "(? = 0 OR ce.visible_to_players = 1)";
const VIS_PC = "(? = 0 OR cp.visible_to_players = 1 OR p.user_id = ?)";
const VIS_PC_EXIST = "(? = 0 OR cp.visible_to_players = 1 OR p.user_id = ?)";

type MonsterSummaryRow = {
    id: number; name: string; level: number | null; monster_type: string;
    is_villain: D1Boolean; dexterity_die: string; insight_die: string;
    might_die: string; willpower_die: string; img_key: string | null;
};

export class D1CampaignReadRepository implements CampaignReadRepositoryPort {
    constructor(private readonly db: D1Database) {}

    async findSessions(campaignId: number, visibleOnly: boolean): Promise<Session[]> {
        const { results } = await this.db
            .prepare(`SELECT s.id,s.session_number,s.title,s.summary,s.notes,s.played_at,s.created_at,s.updated_at FROM sessions s INNER JOIN campaign_entities ce ON ce.entity_id=s.id AND ce.entity_type='session' AND ce.campaign_id=? AND ${VIS} ORDER BY s.session_number DESC`)
            .bind(campaignId, visibleOnly ? 1 : 0)
            .all<Session>();
        return results;
    }

    async findNpcSummaries(campaignId: number, visibleOnly: boolean): Promise<NpcSummary[]> {
        const { results } = await this.db
            .prepare(`SELECT n.id,n.name,n.tagline,n.level,n.dexterity_die,n.insight_die,n.might_die,n.willpower_die,n.img_key FROM npcs n INNER JOIN campaign_entities ce ON ce.entity_id=n.id AND ce.entity_type='npc' AND ce.campaign_id=? AND ${VIS} ORDER BY n.name`)
            .bind(campaignId, visibleOnly ? 1 : 0)
            .all<NpcSummaryRow>();
        return results.map((r) => ({ ...r, dexterity_die: r.dexterity_die as NpcSummary["dexterity_die"], insight_die: r.insight_die as NpcSummary["insight_die"], might_die: r.might_die as NpcSummary["might_die"], willpower_die: r.willpower_die as NpcSummary["willpower_die"] }));
    }

    async findLocations(campaignId: number, visibleOnly: boolean): Promise<Location[]> {
        const { results } = await this.db
            .prepare(`SELECT l.id,l.name,l.tagline,l.description,l.img_key,l.location_type,l.created_at,l.updated_at FROM locations l INNER JOIN campaign_entities ce ON ce.entity_id=l.id AND ce.entity_type='location' AND ce.campaign_id=? AND ${VIS} ORDER BY l.name`)
            .bind(campaignId, visibleOnly ? 1 : 0)
            .all<Location>();
        return results;
    }

    async findFactions(campaignId: number, visibleOnly: boolean): Promise<FactionBase[]> {
        const { results } = await this.db
            .prepare(`SELECT f.id,f.name,f.tagline,f.description,f.img_key,f.faction_type,f.created_at,f.updated_at FROM factions f INNER JOIN campaign_entities ce ON ce.entity_id=f.id AND ce.entity_type='faction' AND ce.campaign_id=? AND ${VIS} ORDER BY f.name`)
            .bind(campaignId, visibleOnly ? 1 : 0)
            .all<FactionBase>();
        return results;
    }

    async findMonsterSummaries(campaignId: number, visibleOnly: boolean): Promise<MonsterSummary[]> {
        const { results } = await this.db
            .prepare(`SELECT m.id,m.name,m.level,m.monster_type,m.is_villain,m.dexterity_die,m.insight_die,m.might_die,m.willpower_die,m.img_key FROM monsters m INNER JOIN campaign_entities ce ON ce.entity_id=m.id AND ce.entity_type='monster' AND ce.campaign_id=? AND ${VIS} ORDER BY m.name`)
            .bind(campaignId, visibleOnly ? 1 : 0)
            .all<MonsterSummaryRow>();
        return results.map((r) => ({ ...r, level: r.level as number, monster_type: r.monster_type as MonsterSummary["monster_type"], is_villain: toBoolean(r.is_villain), dexterity_die: r.dexterity_die as MonsterSummary["dexterity_die"], insight_die: r.insight_die as MonsterSummary["insight_die"], might_die: r.might_die as MonsterSummary["might_die"], willpower_die: r.willpower_die as MonsterSummary["willpower_die"], img_key: r.img_key ?? "" }));
    }

    async findPcSummaries(campaignId: number, visibleOnly: boolean, userId?: number): Promise<PcSummary[]> {
        const { results } = await this.db
            .prepare(`SELECT p.id,p.name,p.tagline,p.dexterity_die,p.insight_die,p.might_die,p.willpower_die,p.img_key FROM pcs p INNER JOIN campaign_pcs cp ON cp.pc_id=p.id AND cp.campaign_id=? AND ${VIS_PC} ORDER BY p.name`)
            .bind(campaignId, visibleOnly ? 1 : 0, userId ?? null)
            .all<PcSummary>();
        return results;
    }

    async isPcInCampaign(campaignId: number, pcId: number, visibleOnly: boolean, userId?: number): Promise<boolean> {
        const result = await this.db
            .prepare(`SELECT 1 FROM campaign_pcs cp INNER JOIN pcs p ON p.id=cp.pc_id WHERE cp.campaign_id=? AND cp.pc_id=? AND ${VIS_PC_EXIST} LIMIT 1`)
            .bind(campaignId, pcId, visibleOnly ? 1 : 0, userId ?? null)
            .first();
        return result !== null;
    }
}

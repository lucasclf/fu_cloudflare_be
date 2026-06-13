import type { Arcana, Job, JobPowerWithJob } from "../../domain/jobs/job";
import type { FactionBase } from "../../domain/factions/faction";
import type { Item } from "../../domain/items/item";
import type { Location } from "../../domain/locations/location";
import type { MonsterSummary } from "../../domain/monsters/monster";
import type { NpcSummary } from "../../domain/npc/npc";
import type { PcSummary } from "../../domain/pc/pc";
import type { Session } from "../../domain/sessions/session";
import type { JobSpellWithJob } from "../../domain/spells/spells";
import type { CampaignHomeStats, CampaignReadRepositoryPort } from "../../application/ports/campaign-read-ports";
import type { D1Boolean } from "../d1-utils";
import { toBoolean } from "../d1-utils";
import type { NpcSummaryRow } from "../rows/npc";
import type { JobRow, PowerWithJobNameRow, SpellWithJobNameRow } from "../rows/job";

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

type ItemRow = Omit<Item, "is_martial"> & { is_martial: D1Boolean };

function parseJobNames(value: string | null): string[] {
    if (value === null || value.trim().length === 0) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
        throw new Error("job_name must be a JSON array of strings");
    }
    return parsed;
}

function toJob(row: JobRow): Job {
    return {
        ...row,
        allows_martial_armor: toBoolean(row.allows_martial_armor),
        allows_martial_shield: toBoolean(row.allows_martial_shield),
        allows_martial_ranged_weapon: toBoolean(row.allows_martial_ranged_weapon),
        allows_martial_melee_weapon: toBoolean(row.allows_martial_melee_weapon),
        allows_arcane: toBoolean(row.allows_arcane),
        allows_rituals: toBoolean(row.allows_rituals),
        allows_monster_spells: toBoolean(row.allows_monster_spells),
        can_start_projects: toBoolean(row.can_start_projects),
        can_cooking: toBoolean(row.can_cooking),
    };
}

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

    async findItems(campaignId: number, visibleOnly: boolean): Promise<Item[]> {
        const { results } = await this.db
            .prepare(`SELECT i.* FROM items i INNER JOIN campaign_entities ce ON ce.entity_id=i.id AND ce.entity_type='item' AND ce.campaign_id=? AND ${VIS} ORDER BY i.item_type, i.weapon_category, i.name`)
            .bind(campaignId, visibleOnly ? 1 : 0)
            .all<ItemRow>();
        return results.map((r) => ({ ...r, is_martial: toBoolean(r.is_martial) }));
    }

    async findSpells(campaignId: number, visibleOnly: boolean): Promise<JobSpellWithJob[]> {
        const { results } = await this.db
            .prepare(`SELECT js.id,js.job_id,j.name AS job_name,js.name,js.description,js.is_offensive,js.cost,js.target,js.duration FROM job_spells js INNER JOIN jobs j ON j.id=js.job_id INNER JOIN campaign_entities ce ON ce.entity_id=js.id AND ce.entity_type='spell' AND ce.campaign_id=? AND ${VIS} ORDER BY j.name, js.name`)
            .bind(campaignId, visibleOnly ? 1 : 0)
            .all<SpellWithJobNameRow>();
        return results.map((r) => ({ ...r, is_offensive: toBoolean(r.is_offensive), nature: "job" as const }));
    }

    async findJobs(campaignId: number, visibleOnly: boolean): Promise<Job[]> {
        const { results } = await this.db
            .prepare(`SELECT j.id,j.name,j.tagline,j.description,j.img_key,j.hp_bonus,j.mp_bonus,j.ip_bonus,j.allows_martial_armor,j.allows_martial_shield,j.allows_martial_ranged_weapon,j.allows_martial_melee_weapon,j.allows_arcane,j.allows_rituals,j.allows_monster_spells,j.can_start_projects,j.can_cooking,j.created_at,j.updated_at FROM jobs j INNER JOIN campaign_entities ce ON ce.entity_id=j.id AND ce.entity_type='job' AND ce.campaign_id=? AND ${VIS} ORDER BY j.name`)
            .bind(campaignId, visibleOnly ? 1 : 0)
            .all<JobRow>();
        return results.map(toJob);
    }

    async findPowers(campaignId: number, visibleOnly: boolean): Promise<JobPowerWithJob[]> {
        const { results } = await this.db
            .prepare(`SELECT jp.id,jp.name,jp.description,jp.type,jp.max_level,jp.is_global, COALESCE(json_group_array(j.name) FILTER (WHERE j.name IS NOT NULL), '[]') AS job_name FROM job_powers jp INNER JOIN campaign_entities ce ON ce.entity_id=jp.id AND ce.entity_type='power' AND ce.campaign_id=? AND ${VIS} LEFT JOIN job_power_jobs jpj ON jpj.power_id=jp.id LEFT JOIN jobs j ON j.id=jpj.job_id GROUP BY jp.id,jp.name,jp.description,jp.type,jp.max_level,jp.is_global ORDER BY jp.id`)
            .bind(campaignId, visibleOnly ? 1 : 0)
            .all<PowerWithJobNameRow>();
        return results.map((r) => ({ id: r.id, name: r.name, description: r.description, type: r.type as JobPowerWithJob["type"], max_level: r.max_level, is_global: toBoolean(r.is_global), job_name: parseJobNames(r.job_name) }));
    }

    async findArcanas(campaignId: number, visibleOnly: boolean): Promise<Arcana[]> {
        const { results } = await this.db
            .prepare(`SELECT a.id,a.name,a.domain,a.merge_effect,a.dismiss_effect,a.special_rule FROM arcanas a INNER JOIN campaign_entities ce ON ce.entity_id=a.id AND ce.entity_type='arcana' AND ce.campaign_id=? AND ${VIS} ORDER BY a.name`)
            .bind(campaignId, visibleOnly ? 1 : 0)
            .all<Arcana>();
        return results;
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

    async findHomeStats(campaignId: number): Promise<CampaignHomeStats> {
        const results = await this.db.batch<{ total: number }>([
            this.db.prepare("SELECT COUNT(*) AS total FROM campaign_members WHERE campaign_id = ?").bind(campaignId),
            this.db.prepare("SELECT COUNT(*) AS total FROM campaign_entities WHERE campaign_id = ? AND entity_type = 'session'").bind(campaignId),
            this.db.prepare("SELECT COUNT(*) AS total FROM campaign_entities WHERE campaign_id = ? AND entity_type = 'npc'").bind(campaignId),
            this.db.prepare("SELECT COUNT(*) AS total FROM campaign_entities WHERE campaign_id = ? AND entity_type = 'location'").bind(campaignId),
            this.db.prepare("SELECT COUNT(*) AS total FROM campaign_entities WHERE campaign_id = ? AND entity_type = 'faction'").bind(campaignId),
            this.db.prepare("SELECT COUNT(*) AS total FROM campaign_entities WHERE campaign_id = ? AND entity_type = 'monster'").bind(campaignId),
            this.db.prepare("SELECT COUNT(*) AS total FROM campaign_pcs WHERE campaign_id = ?").bind(campaignId),
        ]);
        return {
            memberCount:   results[0].results[0]?.total ?? 0,
            sessionCount:  results[1].results[0]?.total ?? 0,
            npcCount:      results[2].results[0]?.total ?? 0,
            locationCount: results[3].results[0]?.total ?? 0,
            factionCount:  results[4].results[0]?.total ?? 0,
            monsterCount:  results[5].results[0]?.total ?? 0,
            pcCount:       results[6].results[0]?.total ?? 0,
        };
    }
}

import { BondTargetSummary, CreatePCInput, UpdatePCInput, PcBase, PcSummary } from "../../domain/pc/pc";
import { PcAlreadyExistsError } from "../../domain/pc/pc_error";
import type { PcExistsPort } from "../../application/ports/pc-ports";

export class D1PCRepository implements PcExistsPort {
    constructor(private readonly db: D1Database){}

    async create(input: CreatePCInput): Promise<number> {
        try {
            const result = await this.db
                .prepare(`
        INSERT INTO pcs (
            name, description, pronouns, origin, identity, theme,
            dexterity_die, insight_die, might_die, willpower_die,
            tagline, money, img_key, user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
                .bind(
                    input.name, input.description, input.pronouns,
                    input.origin, input.identity, input.theme,
                    input.dexterity_die, input.insight_die,
                    input.might_die, input.willpower_die,
                    input.tagline, input.money, input.img_key,
                    input.user_id,
                )
                .run();
            return result.meta.last_row_id;
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new PcAlreadyExistsError(input.name);
            }

            throw error;
        }
    }

    async findAllSummary(globalOnly?: boolean): Promise<PcSummary[]> {
        const globalFilter = globalOnly
            ? "WHERE id NOT IN (SELECT pc_id FROM campaign_pcs)"
            : "";
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    id,
                    name,
                    tagline,
                    dexterity_die,
                    insight_die,
                    might_die,
                    willpower_die,
                    img_key
                FROM pcs
                ${globalFilter}
                ORDER BY name ASC
                `
            ).all<PcSummary>();

        return results
    }

    async findById(pcId: string): Promise<PcBase | null> {
        const result = await this.db
            .prepare(
                `SELECT id, name, description, pronouns, tagline, origin, identity, theme,
                    dexterity_die, insight_die, might_die, willpower_die,
                    money, img_key, user_id, created_at, updated_at
                FROM pcs WHERE id = ?`
            )
            .bind(pcId)
            .first<PcBase>();

        return result;
    }

    async update(pcId: string, input: UpdatePCInput): Promise<void> {
        try {
            await this.db
                .prepare(`UPDATE pcs SET name=?,description=?,pronouns=?,origin=?,identity=?,theme=?,dexterity_die=?,insight_die=?,might_die=?,willpower_die=?,tagline=?,money=?,img_key=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
                .bind(input.name,input.description,input.pronouns,input.origin,input.identity,input.theme,input.dexterity_die,input.insight_die,input.might_die,input.willpower_die,input.tagline,input.money,input.img_key,pcId)
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";
            if (message.includes("UNIQUE constraint failed")) throw new PcAlreadyExistsError(input.name);
            throw error;
        }
    }

    async exists(pcId: number): Promise<boolean> {
        const result = await this.db
            .prepare("SELECT 1 FROM pcs WHERE id = ? LIMIT 1")
            .bind(pcId)
            .first();

        return result !== null;
    }

    async findAccessibleSummary(userId: number, globalOnly?: boolean): Promise<PcSummary[]> {
        if (globalOnly) {
            const { results } = await this.db
                .prepare(
                    `
                    SELECT id, name, tagline, dexterity_die, insight_die, might_die, willpower_die, img_key
                    FROM pcs
                    WHERE user_id = ? AND id NOT IN (SELECT pc_id FROM campaign_pcs)
                    ORDER BY name ASC
                    `
                )
                .bind(userId)
                .all<PcSummary>();

            return results;
        }

        const { results } = await this.db
            .prepare(
                `
                SELECT id, name, tagline, dexterity_die, insight_die, might_die, willpower_die, img_key
                FROM pcs
                WHERE user_id = ?
                UNION
                SELECT p.id, p.name, p.tagline, p.dexterity_die, p.insight_die, p.might_die, p.willpower_die, p.img_key
                FROM pcs p
                JOIN campaign_pcs cp ON cp.pc_id = p.id
                JOIN campaign_members cm ON cm.campaign_id = cp.campaign_id
                WHERE cm.user_id = ? AND (cp.visible_to_players = 1 OR cm.role = 'master')
                ORDER BY name ASC
                `
            )
            .bind(userId, userId)
            .all<PcSummary>();

        return results;
    }

    async canUserAccessPc(pcId: string, userId: number): Promise<boolean> {
        const result = await this.db
            .prepare(
                `
                SELECT 1 FROM pcs WHERE id = ? AND user_id = ?
                UNION
                SELECT 1 FROM campaign_pcs cp
                JOIN campaign_members cm ON cm.campaign_id = cp.campaign_id
                WHERE cp.pc_id = ? AND cm.user_id = ? AND (cp.visible_to_players = 1 OR cm.role = 'master')
                LIMIT 1
                `
            )
            .bind(pcId, userId, pcId, userId)
            .first();

        return result !== null;
    }

    async findBondTargetsByIds(
        pcIds: number[],
    ): Promise<Map<number, BondTargetSummary>> {
        if (pcIds.length === 0) {
            return new Map();
        }

        const uniqueIds = [...new Set(pcIds)];
        const placeholders = uniqueIds.map(() => "?").join(",");

        const { results } = await this.db
            .prepare(`
                SELECT
                    id,
                    name,
                    img_key
                FROM pcs
                WHERE id IN (${placeholders})
            `)
            .bind(...uniqueIds)
            .all<BondTargetSummary>();

        const targetsById = new Map<number, BondTargetSummary>();

        for (const target of results) {
            targetsById.set(target.id, target);
        }

        return targetsById;
    }
}
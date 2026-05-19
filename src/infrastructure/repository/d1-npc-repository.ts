import { CreateNpcInput, Npc, NpcSummary } from "../../domain/npc/npc";
import { NpcAlreadyExistsError } from "../../domain/npc/npc_error";
import { BondTargetSummary } from "../../domain/pc/pc";
import { uniqueNumbers, buildInPlaceholders, mapById } from "../d1-utils";
import { BondTargetSummaryEntity } from "../entity/monster";
import { NpcSummaryEntity, NpcEntity } from "../entity/npc";

export class D1NpcRepository {
    constructor(private readonly db: D1Database){}

    async create(input: CreateNpcInput): Promise<void> {
        try{
            await this.db
             .prepare(`
                INSERT INTO npcs(
                    name,
                    description,
                    tagline,
                    level,
                    dexterity_die,
                    insight_die,
                    might_die,
                    willpower_die,
                    hp,
                    mp,
                    initiative,
                    defense,
                    magic_defense,
                    img_key
                ) 
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)                
            `)
            .bind(
                input.name,
                input.description,
                input.tagline,
                input.level,
                input.dexterity_die,
                input.insight_die,
                input.might_die,
                input.willpower_die,
                input.hp,
                input.mp,
                input.initiative,
                input.defense,
                input.magic_defense,
                input.img_key
            ).run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new NpcAlreadyExistsError(input.name);
            }

            throw error;
        }
    }

    async findAll(): Promise<Npc[]> {
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    id,   
                    name,   
                    description,
                    tagline,
                    level,
                    dexterity_die,
                    insight_die,
                    might_die,
                    willpower_die,
                    hp,
                    mp,
                    initiative,
                    defense,
                    magic_defense,
                    img_key,
                    created_at,
                    updated_at
                FROM NPCS
                ORDER BY name ASC
                `
            ).all<Npc>();
        
        return results
    }

    async findAllSummary(): Promise<NpcSummary[]> {
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    id,
                    name,
                    tagline,
                    level,
                    dexterity_die,
                    insight_die,
                    might_die,
                    willpower_die,
                    img_key
                FROM NPCS
                ORDER BY name ASC
                `
            ).all<NpcSummaryEntity>();

        return results.map((row) => this.toNpcSummary(row));
    }

    async finById(npcId: string): Promise<Npc | null> {
        const result = await this.db
            .prepare(
                `
                SELECT
                    id,   
                    name,   
                    description,
                    tagline,
                    level,
                    dexterity_die,
                    insight_die,
                    might_die,
                    willpower_die,
                    hp,
                    mp,
                    initiative,
                    defense,
                    magic_defense,
                    img_key,
                    created_at,
                    updated_at
                FROM NPCS
                WHERE id = ?
                ORDER BY name ASC
                `
            )
            .bind(npcId)
            .first<NpcEntity>();

        return result ? this.toNpc(result) : null;
    }
    
    async findBondTargetsByIds(
        npcIds: number[],
    ): Promise<Map<number, BondTargetSummary>> {
        if (npcIds.length === 0) {
            return new Map();
        }

        const uniqueNpcIds = uniqueNumbers(npcIds);
        const placeholders = buildInPlaceholders(uniqueNpcIds);

        const { results } = await this.db
            .prepare(`
                SELECT
                    id,
                    name,
                    img_key
                FROM npcs
                WHERE id IN (${placeholders})
            `)
            .bind(...uniqueNpcIds)
            .all<BondTargetSummaryEntity>();

        return mapById(results);
    }

    private toNpc(row: NpcEntity): Npc {
        return {
            ...row,
            dexterity_die: row.dexterity_die as Npc["dexterity_die"],
            insight_die: row.insight_die as Npc["insight_die"],
            might_die: row.might_die as Npc["might_die"],
            willpower_die: row.willpower_die as Npc["willpower_die"],
        };
    }

    private toNpcSummary(row: NpcSummaryEntity): NpcSummary {
        return {
            ...row,
            dexterity_die: row.dexterity_die as NpcSummary["dexterity_die"],
            insight_die: row.insight_die as NpcSummary["insight_die"],
            might_die: row.might_die as NpcSummary["might_die"],
            willpower_die: row.willpower_die as NpcSummary["willpower_die"],
        };
    }
}   
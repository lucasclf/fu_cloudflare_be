import { CreateMonsterInput, Monster, MonsterSummary, MonsterTrait } from "../../domain/monsters/monster";
import { MonsterAlreadyExistsError } from "../../domain/monsters/monster-error";
import { BondTargetSummary } from "../../domain/pc/pc";
import { D1Boolean, fromBoolean, uniqueNumbers, buildInPlaceholders, mapById, toBoolean } from "../d1-utils";
import { MonsterRow, BondTargetSummaryRow } from "../rows/monster";

export class D1MonsterRepository {
    constructor(private readonly db: D1Database) {}

    async create(input: CreateMonsterInput): Promise<number> {
        try {
            const result = await this.db
                .prepare(`
                INSERT INTO monsters (
                    name,
                    description,
                    monster_type,
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
                    equipment,
                    img_key,
                    source_page,
                    is_villain,
                    ultima_points,
                    strategy
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                    input.name,
                    input.description,
                    input.monster_type,
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
                    input.equipment,
                    input.img_key,
                    input.source_page,
                    fromBoolean(input.is_villain),
                    input.ultima_points,
                    input.strategy
                )
                .run();

            return result.meta.last_row_id;
        } catch(error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new MonsterAlreadyExistsError(input.name);
            }

            throw error;
        }
    }

    async findAll(): Promise<Monster[]> {
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    id,   
                    name,   
                    description,
                    monster_type,
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
                    updated_at,
                    is_villain,
                    ultima_points,
                    strategy
                FROM monsters
                ORDER BY name ASC
                `
            ).all<MonsterRow>();

        return results.map((row) => this.toMonster(row));
    }

    async findAllSummary(globalOnly?: boolean): Promise<MonsterSummary[]> {
        const globalFilter = globalOnly
            ? "WHERE id NOT IN (SELECT entity_id FROM campaign_entities WHERE entity_type = 'monster')"
            : "";
        const { results } = await this.db
            .prepare(
                `
                SELECT
                    id,
                    name,
                    level,
                    monster_type,
                    dexterity_die,
                    insight_die,
                    might_die,
                    willpower_die,
                    img_key,
                    is_villain
                FROM monsters
                ${globalFilter}
                ORDER BY level ASC
                `
            ).all<MonsterSummary>();

        return results;
    }

    async findById(monsterId: string): Promise<Monster | null> {
        const result = await this.db
            .prepare(`
                SELECT
                    id,   
                    name,   
                    description,
                    monster_type,
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
                    updated_at,
                    is_villain,
                    ultima_points,
                    strategy
                FROM monsters
                WHERE id = ?
                LIMIT 1
            `)
            .bind(monsterId)
            .first<MonsterRow>();

        return result ? this.toMonster(result) : null;
    }

    async update(id: number, input: CreateMonsterInput): Promise<void> {
        await this.db
            .prepare(`
                UPDATE monsters SET
                    name = ?,
                    description = ?,
                    monster_type = ?,
                    level = ?,
                    dexterity_die = ?,
                    insight_die = ?,
                    might_die = ?,
                    willpower_die = ?,
                    hp = ?,
                    mp = ?,
                    initiative = ?,
                    defense = ?,
                    magic_defense = ?,
                    equipment = ?,
                    img_key = ?,
                    source_page = ?,
                    is_villain = ?,
                    ultima_points = ?,
                    strategy = ?,
                    updated_at = datetime('now')
                WHERE id = ?
            `)
            .bind(
                input.name,
                input.description,
                input.monster_type,
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
                input.equipment,
                input.img_key,
                input.source_page,
                fromBoolean(input.is_villain),
                input.ultima_points,
                input.strategy,
                id
            )
            .run();
    }

    async findBondTargetsByIds(
        monsterIds: number[],
    ): Promise<Map<number, BondTargetSummary>> {
        if (monsterIds.length === 0) {
            return new Map();
        }

        const uniqueMonsterIds = uniqueNumbers(monsterIds);
        const placeholders = buildInPlaceholders(uniqueMonsterIds);

        const { results } = await this.db
            .prepare(`
                SELECT
                    id,
                    name,
                    img_key
                FROM monsters
                WHERE id IN (${placeholders})
            `)
            .bind(...uniqueMonsterIds)
            .all<BondTargetSummaryRow>();

        return mapById(results);
    }

    private toMonster(row: MonsterRow): Monster {
        return {
            ...row,
            monster_type: row.monster_type as Monster["monster_type"],
            dexterity_die: row.dexterity_die as Monster["dexterity_die"],
            insight_die: row.insight_die as Monster["insight_die"],
            might_die: row.might_die as Monster["might_die"],
            willpower_die: row.willpower_die as Monster["willpower_die"],
            is_villain: toBoolean(row.is_villain),
        };
    }
}
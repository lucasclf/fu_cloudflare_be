import { CreateActionInput, Monster, MonsterAction } from "../../domain/monsters/monster";
import { MonsterActionAlreadyExistsError } from "../../domain/monsters/monster-error";
import { MonsterSpell } from "../../domain/spells/spells";
import { buildInPlaceholders, D1Boolean, fromBoolean, mapById, toBoolean, uniqueNumbers } from "../d1-utils";
import { MonsterActionEntity, MonsterSpellEntity } from "../entity/monster";

export class D1MonsterActionRepository {
    constructor(private readonly db: D1Database){}

    async create(input: CreateActionInput): Promise<void> {
        try {
            await this.db
                .prepare(`
                INSERT INTO monster_actions (
                    monster_id,
                    action_type,
                    action_icon,
                    name,
                    description,
                    check_formula,
                    accuracy_bonus,
                    damage_type,
                    cost,
                    target,
                    duration,
                    is_offensive
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                    input.monster_id,
                    input.action_type,
                    input.action_icon,
                    input.name,
                    input.description,
                    input.check_formula,
                    input.accuracy_bonus,
                    input.damage_type,
                    input.cost,
                    input.target,
                    input.duration,
                    fromBoolean(input.is_offensive)
                )
                .run();
        } catch(error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new MonsterActionAlreadyExistsError(input.name);
            }

            throw error;
        }
    }

    async findByMonstersIds(monsterIds: number[]): Promise<Map<number, MonsterAction[]>> {
        if (monsterIds.length === 0) {
            return new Map();
        }

        const placeholders = monsterIds.map(() => "?").join(",");

        const { results } = await this.db
            .prepare(`
            SELECT
                id,
                monster_id,
                action_type,
                action_icon,
                name,
                description,
                check_formula,
                accuracy_bonus,
                damage_type,
                cost,
                target,
                duration,
                is_offensive
            FROM monster_actions
            WHERE monster_id IN (${placeholders})
            ORDER BY monster_id ASC, action_type ASC
            `)
            .bind(...monsterIds)
            .all<MonsterActionEntity>();

        const grouped = new Map<number, MonsterAction[]>();

        for (const row of results) {
            const action = this.toMonsterAction(row);
            const current = grouped.get(action.monster_id) ?? [];

            current.push(action);
            grouped.set(action.monster_id, current);
        }

        return grouped;
    }

    async listSpells(): Promise<MonsterSpell[]> {
        const { results } = await this.db
            .prepare(`
                SELECT
                    ms.id,
                    ms.name,
                    ms.description,
                    ms.is_offensive,
                    ms.cost,
                    ms.target,
                    ms.duration
                FROM monster_actions ms
                WHERE action_type = 'spell'
                ORDER BY ms.id ASC
            `)
            .all<MonsterSpellEntity>();

        return results.map((row) => this.toMonsterSpell(row));
    }

    async isMonsterSpell(
        actionId: number,
    ): Promise<boolean> {
        const result = await this.db
            .prepare(`
                SELECT
                    id
                FROM monster_actions
                WHERE id = ?
                AND action_type = 'spell'
                LIMIT 1
            `)
            .bind(actionId)
            .first<{ id: number }>();

        return result !== null;
    }

    async findAll(include: string[]): Promise<MonsterAction[]> {
        const hasActionTypeFilter = include.length > 0;

        const whereClause = hasActionTypeFilter
            ? `WHERE action_type IN (${include.map(() => "?").join(",")})`
            : "";
        
        const query = `
            SELECT
                id,
                monster_id,
                action_type,
                action_icon,
                name,
                description,
                check_formula,
                accuracy_bonus,
                damage_type,
                cost,
                target,
                duration,
                is_offensive
            FROM monster_actions
            ${whereClause}
            ORDER BY
                action_type ASC,
                name ASC
        `;

        const statement = this.db.prepare(query);

        const { results } = hasActionTypeFilter
            ? await statement.bind(...include).all<MonsterActionEntity>()
            : await statement.all<MonsterActionEntity>();

        return results.map((row) => this.toMonsterAction(row));
    }

    async findByIds(
        monsterActionIds: number[],
    ): Promise<Map<number, MonsterAction>> {
        if (monsterActionIds.length === 0) {
            return new Map();
        }

        const uniqueMonsterActionIds = uniqueNumbers(monsterActionIds);
        const placeholders = buildInPlaceholders(uniqueMonsterActionIds);

        const { results } = await this.db
            .prepare(`
                SELECT
                    id,
                    monster_id,
                    action_type,
                    action_icon,
                    name,
                    description,
                    check_formula,
                    accuracy_bonus,
                    damage_formula,
                    damage_type,
                    cost,
                    target,
                    duration,
                    is_offensive
                FROM monster_actions
                WHERE id IN (${placeholders})
                ORDER BY name ASC
            `)
            .bind(...uniqueMonsterActionIds)
            .all<MonsterActionEntity>();

        const actions = results.map((row) => this.toMonsterAction(row));

        return mapById(actions);
    }

    private toMonsterAction(row: MonsterActionEntity): MonsterAction {
        return {
            ...row,
            action_type: row.action_type as MonsterAction["action_type"],
            action_icon: row.action_icon as MonsterAction["action_icon"],
            damage_type: row.damage_type as MonsterAction["damage_type"],
            is_offensive: toBoolean(row.is_offensive),
        };
    }

    private toMonsterSpell(row: MonsterSpellEntity): MonsterSpell {
        if (row.cost === null) {
            throw new Error(`Monster spell ${row.id} has null cost`);
        }

        if (row.target === null) {
            throw new Error(`Monster spell ${row.id} has null target`);
        }

        if (row.duration === null) {
            throw new Error(`Monster spell ${row.id} has null duration`);
        }

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            is_offensive: toBoolean(row.is_offensive),
            cost: row.cost,
            target: row.target,
            duration: row.duration,
            nature: "monster",
        };
    }
}
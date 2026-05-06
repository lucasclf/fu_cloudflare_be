import { CreateActionInput, MonsterAction } from "../domain/monsters/monster";
import { MonsterActionAlreadyExistsError } from "../domain/monsters/monster-error";
import { MonsterSpell } from "../domain/spells/spells";

export class D1MonsterActionRepository {
    constructor(private readonly db: D1Database){}

    async createMonsterAction(input: CreateActionInput): Promise<void> {
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
                    input.is_offensive,
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
            .all<MonsterAction>();

        const grouped = new Map<number, MonsterAction[]>();

        for (const action of results) {
            const current = grouped.get(action.monster_id) ?? [];
            current.push(action);
            grouped.set(action.monster_id, current);
        }

        return grouped;
    }

    async listMonsterSpells(): Promise<MonsterSpell[]> {
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
            .all<MonsterSpell>();

        return results.map((spell) => ({
            ...spell,
            nature: "monster",
        }));
    }
}
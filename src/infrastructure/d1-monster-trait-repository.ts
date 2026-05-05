import { CreateMonsterTraitInput, MonsterTrait } from "../domain/monsters/monster";
import { MonsterTraitAlreadyExistsError } from "../domain/monsters/monster-error";

export class D1MonsterTraitRepository {
    constructor(private readonly db: D1Database) {}

    async createMonsterTrait(input: CreateMonsterTraitInput): Promise<void> {
        try {
            await this.db
                .prepare(`
                INSERT INTO monster_traits (
                    monster_id,
                    trait
                )
                VALUES (?, ?)
            `).bind(
                    input.monster_id,
                    input.trait
                )
                .run();
        } catch(error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new MonsterTraitAlreadyExistsError(input.trait);
            }

            throw error;
        }
    }

    
    async findByMonstersIds(monsterIds: number[]): Promise<Map<number, MonsterTrait[]>> {
        if (monsterIds.length === 0) {
			return new Map();
		}

        const placeholders = monsterIds.map(() => "?").join(",");

        const { results } = await this.db
            .prepare(`
            SELECT
                monster_id,
                trait
            FROM monster_traits
            WHERE monster_id IN (${placeholders})
            ORDER BY monster_id ASC
            `)
            .bind(...monsterIds)
            .all<MonsterTrait>();

        const grouped = new Map<number, MonsterTrait[]>();

        for (const trait of results) {
            const current = grouped.get(trait.monster_id) ?? [];
            current.push(trait);
            grouped.set(trait.monster_id, current);
        }

        return grouped;
    }
}
import { CreateAffinityInput, MonsterAffinity } from "../../domain/monsters/monster";
import { MonsterAffinityAlreadyExistsError } from "../../domain/monsters/monster-error";
import { uniqueNumbers, buildInPlaceholders } from "../d1-utils";

export class D1MonsterAffinityRepository {
    constructor(private readonly db: D1Database){}

    async create(input: CreateAffinityInput): Promise<void> {
        try {
            await this.db
                .prepare(`
                INSERT INTO monster_affinities (
                    monster_id,
                    physical,
                    air,
                    bolt,
                    dark,
                    earth,
                    fire,
                    ice,
                    light,
                    poison
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                    input.monster_id,
                    input.physical,
                    input.air,
                    input.bolt,
                    input.dark,
                    input.earth,
                    input.fire,
                    input.ice,
                    input.light,
                    input.poison
                )
                .run();
        } catch(error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new MonsterAffinityAlreadyExistsError(input.monster_id);
            }

            throw error;
        }
    }

    async deleteByMonsterId(monsterId: number): Promise<void> {
        await this.db
            .prepare(`DELETE FROM monster_affinities WHERE monster_id = ?`)
            .bind(monsterId)
            .run();
    }

    async findByMonstersIds(
        monsterIds: number[],
    ): Promise<Map<number, MonsterAffinity>> {
        if (monsterIds.length === 0) {
            return new Map();
        }

        const uniqueMonsterIds = uniqueNumbers(monsterIds);
        const placeholders = buildInPlaceholders(uniqueMonsterIds);

        const { results } = await this.db
            .prepare(`
                SELECT
                    monster_id,
                    physical,
                    air,
                    bolt,
                    dark,
                    earth,
                    fire,
                    ice,
                    light,
                    poison
                FROM monster_affinities
                WHERE monster_id IN (${placeholders})
                ORDER BY monster_id ASC
            `)
            .bind(...uniqueMonsterIds)
            .all<MonsterAffinity>();

        const mapped = new Map<number, MonsterAffinity>();

        for (const affinity of results) {
            mapped.set(affinity.monster_id, affinity);
        }

        return mapped;
    }
}
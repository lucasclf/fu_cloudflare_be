import { SpellAlreadyExistsError } from "../domain/spells/spell-errors";
import { CreateMonsterSpellInput, MonsterSpell } from "../domain/spells/spells";

export class D1MonsterActionRepository {
	constructor(private readonly db: D1Database) {}

    async createMonsterSpell(input: CreateMonsterSpellInput): Promise<void> {
        try {
            await this.db
                .prepare(`
            INSERT INTO monster_spells (
                name,
                description,
                is_offensive,
                cost,
                target,
                duration
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `)
                .bind(
                    input.name,
                    input.description,
                    input.is_offensive,
                    input.cost,
                    input.target,
                    input.duration,
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new SpellAlreadyExistsError(input.name);
            }

            throw error;
        }
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
                FROM monster_spells ms
                ORDER BY ms.id ASC
                `)
                .all<MonsterSpell>();
    
            return results.map((spell) => ({
                ...spell,
                nature: "monster",
            }));
        }

}
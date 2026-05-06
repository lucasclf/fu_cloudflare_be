import { SpellAlreadyExistsError } from "../domain/spells/spell-errors";
import { CreateMonsterSpellInput, MonsterSpell } from "../domain/spells/spells";

export class D1MonsterSpellRepository {
	constructor(private readonly db: D1Database) {}


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
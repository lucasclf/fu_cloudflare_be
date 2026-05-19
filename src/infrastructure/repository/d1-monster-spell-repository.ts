import { MonsterSpell } from "../../domain/spells/spells";

export class D1MonsterSpellRepository {
	constructor(private readonly db: D1Database) {}

      async findByIds(spellIds: number[]): Promise<Map<number, MonsterSpell>> {
        if (spellIds.length === 0) {
          return new Map();
        }
    
        const uniqueSpellIds = [...new Set(spellIds)];
        const placeholders = uniqueSpellIds.map(() => "?").join(",");
    
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
            WHERE id IN (${placeholders})
            ORDER BY name ASC
          `)
          .bind(...uniqueSpellIds)
          .all<MonsterSpell>();
    
        const spellsById = new Map<number, MonsterSpell>();
    
        for (const spell of results) {
          spellsById.set(spell.id, {
            ...spell,
            is_offensive: Boolean(spell.is_offensive),
            nature: "monster"
          });
        }
    
        return spellsById;
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
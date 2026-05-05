import { CreateMonsterInput, Monster, MonsterSummary, MonsterTrait } from "../domain/monsters/monster";
import { MonsterAlreadyExistsError } from "../domain/monsters/monster-error";

export class D1MonsterRepository {
    constructor(private readonly db: D1Database) {}

    async createMonster(input: CreateMonsterInput): Promise<void> {
        try {
            await this.db
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
                    crisis_hp,
                    mp,
                    initiative,
                    defense,
                    magic_defense,
                    equipment,
                    img_key,
                    source_page
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    input.crisis_hp,
                    input.mp,
                    input.initiative,
                    input.defense,
                    input.magic_defense,
                    input.equipment,
                    input.img_key,
                    input.source_page
                )
                .run();
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
                    crisis_hp,
                    mp,
                    initiative,
                    defense,
                    magic_defense,
                    img_key,
                    created_at,
                    updated_at
                FROM monsters
                ORDER BY name ASC
                `
            ).all<Monster>();
        
        return results;
    }

    async findAllSummaries(): Promise<MonsterSummary[]> {
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
                    willpower_die
                FROM monsters
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
                    crisis_hp,
                    mp,
                    initiative,
                    defense,
                    magic_defense,
                    img_key,
                    created_at,
                    updated_at
                FROM monsters
                WHERE id = ?
                LIMIT 1
            `)
            .bind(monsterId)
            .first<Monster>();

        return result;
    }
}
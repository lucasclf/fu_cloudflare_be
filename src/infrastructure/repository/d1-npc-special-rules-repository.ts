import { CreateSpecialRulesInput, NpcSpecialRules } from "../../domain/npc/npc";
import { SpecialRulesAlreadyExistsError } from "../../domain/npc/npc_error";
import { uniqueNumbers, buildInPlaceholders, groupByNumberKey } from "../d1-utils";
import { NpcSpecialRulesRow } from "../rows/npc";


export class D1NpcSpecialRulesRepository {
    constructor(private readonly db: D1Database){}

    async create(input: CreateSpecialRulesInput): Promise<void> {
        try {
            const metadata = input.metadata
            ? JSON.stringify(input.metadata)
            : null;

        await this.db
            .prepare(`
                INSERT INTO npc_special_rules (
                    npc_id,
                    type,
                    title,
                    description,
                    metadata
                ) VALUES (?, ?, ?, ?, ?)
            `)
            .bind(
                input.npc_id,
                input.type,
                input.title,
                input.description,
                metadata,
            )
            .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new SpecialRulesAlreadyExistsError(input.title);
            }

            throw error;
        }        
    }

    async findByNpcsIds(
        npcIds: number[],
    ): Promise<Map<number, NpcSpecialRules[]>> {
        if (npcIds.length === 0) {
            return new Map();
        }

        const uniqueNpcIds = uniqueNumbers(npcIds);
        const placeholders = buildInPlaceholders(uniqueNpcIds);

        const { results } = await this.db
            .prepare(`
                SELECT
                    id,
                    npc_id,
                    type,
                    title,
                    description,
                    metadata,
                    created_at,
                    updated_at
                FROM npc_special_rules
                WHERE npc_id IN (${placeholders})
                ORDER BY npc_id ASC, title ASC
            `)
            .bind(...uniqueNpcIds)
            .all<NpcSpecialRulesRow>();

        const rules = results.map((row) => this.toNpcSpecialRule(row));

        return groupByNumberKey(rules, (rule) => rule.npc_id);
    }

    private toNpcSpecialRule(row: NpcSpecialRulesRow): NpcSpecialRules {
        return {
            id: row.id,
            npc_id: row.npc_id,
            type: row.type as NpcSpecialRules["type"],
            title: row.title,
            description: row.description,
            metadata: row.metadata ? JSON.parse(row.metadata) : null,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
}
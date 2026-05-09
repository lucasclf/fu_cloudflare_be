import { CreateSpecialRulesInput, NpcSpecialRules, NpcSpecialRulesRow } from "../domain/npc/npc";
import { SpecialRulesAlreadyExistsError } from "../domain/npc/npc_error";

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

    async findByNpcsIds(npcsIds: number[]): Promise<Map<number, NpcSpecialRules[]>> {
        if (npcsIds.length === 0) {
            return new Map();
        }

        const placeholders = npcsIds.map(() => "?").join(",");

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
                ORDER BY npc_id ASC
            `)
            .bind(...npcsIds)
            .all<NpcSpecialRulesRow>();

        const grouped = new Map<number, NpcSpecialRules[]>();

        for (const row of results) {
            const rule = mapNpcSpecialRulesRow(row);

            const current = grouped.get(rule.npc_id) ?? [];
            current.push(rule);
            grouped.set(rule.npc_id, current);
        }

        return grouped;
    }
}

function parseMetadata(metadata: string | null): Record<string, unknown> | null {
    if (!metadata) {
        return null;
    }

    try {
        const parsed = JSON.parse(metadata);

        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            return null;
        }

        return parsed as Record<string, unknown>;
    } catch {
        return null;
    }
}

function mapNpcSpecialRulesRow(row: NpcSpecialRulesRow): NpcSpecialRules {
    return {
        id: row.id,
        npc_id: row.npc_id,
        type: row.type,
        title: row.title,
        description: row.description,
        metadata: parseMetadata(row.metadata),
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}
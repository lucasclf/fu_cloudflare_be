import { CreateJobPowerInput, JobPower, JobPowerWithJob, ResumeJob } from "../../domain/jobs/job";
import { JobPowerAlreadyExistsError } from "../../domain/jobs/job-errors";
import { D1Boolean, fromBoolean, uniqueNumbers, buildInPlaceholders, mapById, toBoolean } from "../d1-utils";
import { PowerRow, PowerWithJobNameRow } from "../rows/job";

export class D1JobPowerRepository {
	constructor(private readonly db: D1Database) {}

    async findByJobIds(
        jobIds: number[],
    ): Promise<Map<number, JobPower[]>> {
        if (jobIds.length === 0) {
            return new Map();
        }

        const uniqueJobIds = uniqueNumbers(jobIds);
        const placeholders = buildInPlaceholders(uniqueJobIds);

        const { results } = await this.db
            .prepare(`
                SELECT
                    jpj.job_id,
                    jp.id,
                    jp.name,
                    jp.description,
                    jp.type,
                    jp.max_level,
                    jp.is_global
                FROM job_power_jobs jpj
                INNER JOIN job_powers jp
                    ON jp.id = jpj.power_id
                WHERE jpj.job_id IN (${placeholders})
                ORDER BY jpj.job_id ASC, jp.name ASC
            `)
            .bind(...uniqueJobIds)
            .all<PowerRow & { job_id: number }>();

        const grouped = new Map<number, JobPower[]>();

        for (const row of results) {
            const power = this.toJobPower(row);
            const current = grouped.get(row.job_id) ?? [];

            current.push(power);
            grouped.set(row.job_id, current);
        }

        return grouped;
    }

	async create(input: CreateJobPowerInput): Promise<void> {
        try {
            const statements = [
                this.db
                    .prepare(`
                        INSERT INTO job_powers (
                            name,
                            description,
                            type,
                            max_level,
                            is_global
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `)
                    .bind(
                        input.name,
                        input.description,
                        input.type,
                        input.max_level,
                        fromBoolean(input.is_global),
                    ),
            ];

            if (
                input.job_id !== undefined &&
                input.job_id !== null &&
                input.job_id.length > 0
            ) {
                for (const jobId of input.job_id) {
                    statements.push(
                        this.db
                            .prepare(`
                                INSERT INTO job_power_jobs (
                                    job_id,
                                    power_id
                                )
                                VALUES (
                                    ?,
                                    (
                                        SELECT id
                                        FROM job_powers
                                        WHERE name = ?
                                    )
                                )
                            `)
                            .bind(
                                jobId,
                                input.name,
                            ),
                    );
                }
            }

            await this.db.batch(statements);
        } catch (error) {
            const message = error instanceof Error ? error.message : "";

            if (message.includes("UNIQUE constraint failed")) {
                throw new JobPowerAlreadyExistsError(input.name);
            }

            throw error;
        }
    }

    async findAll(globalOnly?: boolean): Promise<JobPowerWithJob[]> {
        const globalFilter = globalOnly
            ? "WHERE jp.id NOT IN (SELECT entity_id FROM campaign_entities WHERE entity_type = 'power')"
            : "";
        const { results } = await this.db
            .prepare(`
                SELECT
                    jp.id,
                    jp.name,
                    jp.description,
                    jp.type,
                    jp.max_level,
                    jp.is_global,
                    COALESCE(
                        json_group_array(j.name) FILTER (WHERE j.name IS NOT NULL),
                        '[]'
                    ) AS job_name
                FROM job_powers jp
                LEFT JOIN job_power_jobs jpj
                    ON jpj.power_id = jp.id
                LEFT JOIN jobs j
                    ON j.id = jpj.job_id
                ${globalFilter}
                GROUP BY
                    jp.id,
                    jp.name,
                    jp.description,
                    jp.type,
                    jp.max_level,
                    jp.is_global
                ORDER BY jp.id ASC
            `)
            .all<PowerWithJobNameRow>();

        return results.map((row) => this.toJobPowerWithJob(row));
    }

    async findByIds(powerIds: number[]): Promise<Map<number, JobPower>> {
        if (powerIds.length === 0) {
            return new Map();
        }

        const uniquePowerIds = uniqueNumbers(powerIds);
        const placeholders = buildInPlaceholders(uniquePowerIds);

        const { results } = await this.db
            .prepare(`
                SELECT
                    id,
                    name,
                    description,
                    type,
                    max_level,
                    is_global
                FROM job_powers
                WHERE id IN (${placeholders})
                ORDER BY name ASC
            `)
            .bind(...uniquePowerIds)
            .all<PowerRow>();

        const powers = results.map((row) => this.toJobPower(row));

        return mapById(powers);
    }

    private toJobPower(row: PowerRow): JobPower {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            type: row.type as JobPower["type"],
            max_level: row.max_level,
            is_global: toBoolean(row.is_global),
        };
    }

    private toJobPowerWithJob(row: PowerWithJobNameRow): JobPowerWithJob {
        return {
            ...this.toJobPower(row),
            job_name: this.parseJobNames(row.job_name),
        };
    }

    private parseJobNames(value: string | null): string[] {
        if (value === null || value.trim().length === 0) {
            return [];
        }

        const parsed: unknown = JSON.parse(value);

        if (!Array.isArray(parsed)) {
            throw new Error("job_name must be a JSON array");
        }

        if (!parsed.every((item) => typeof item === "string")) {
            throw new Error("job_name must contain only strings");
        }

        return parsed;
    }
}

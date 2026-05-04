import { CreateJobPowerInput, JobPower, JobPowerWithJob } from "../domain/jobs/job";
import { JobPowerAlreadyExistsError } from "../domain/jobs/job-errors";

type JobPowerRow = JobPower & {
	job_id: number;
};

type JobPowerWithJobRow = {
	id: number;
	name: string;
	description: string;
	type: "common" | "heroic";
	max_level: number;
	is_global: number;
	job_name: string; // vem como JSON string do banco
};

export class D1JobPowerRepository {
	constructor(private readonly db: D1Database) {}

	async findPowersByJobIds(jobIds: number[]): Promise<Map<number, JobPower[]>> {
		if (jobIds.length === 0) {
			return new Map();
		}

		const valuesPlaceholders = jobIds.map(() => "(?)").join(",");

		const { results } = await this.db
			.prepare(`
                WITH input_jobs(job_id) AS (
                    VALUES ${valuesPlaceholders}
                )

                SELECT
                    result.job_id,
                    result.id,
                    result.name,
                    result.description,
                    result.type,
                    result.max_level,
                    result.is_global,
                    result.created_at,
                    result.updated_at
                FROM (
                    SELECT
                        jpj.job_id,
                        jp.id,
                        jp.name,
                        jp.description,
                        jp.type,
                        jp.max_level,
                        jp.is_global,
                        jp.created_at,
                        jp.updated_at
                    FROM input_jobs ij
                    INNER JOIN job_power_jobs jpj
                        ON jpj.job_id = ij.job_id
                    INNER JOIN job_powers jp
                        ON jp.id = jpj.power_id

                    UNION ALL

                    SELECT
                        ij.job_id,
                        jp.id,
                        jp.name,
                        jp.description,
                        jp.type,
                        jp.max_level,
                        jp.is_global,
                        jp.created_at,
                        jp.updated_at
                    FROM input_jobs ij
                    INNER JOIN job_powers jp
                        ON jp.is_global = 1
                ) result
                ORDER BY
                    result.is_global ASC,
                    result.job_id ASC,
                    result.id ASC,
                    result.type ASC,
                    result.name ASC
            `)
			.bind(...jobIds)
			.all<JobPowerRow>();

		const grouped = new Map<number, JobPower[]>();

		for (const jobId of jobIds) {
			grouped.set(jobId, []);
		}

		for (const row of results) {
			const current = grouped.get(row.job_id) ?? [];

			current.push({
				id: row.id,
				name: row.name,
				description: row.description,
				type: row.type,
				max_level: row.max_level,
				is_global: row.is_global,
			});

			grouped.set(row.job_id, current);
		}

		return grouped;
	}

	async createJobPower(input: CreateJobPowerInput): Promise<void> {
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
                        input.is_global ? 1 : 0,
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

    async listPowers(): Promise<JobPowerWithJob[]> {
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
                GROUP BY
                    jp.id,
                    jp.name,
                    jp.description,
                    jp.type,
                    jp.max_level,
                    jp.is_global
                ORDER BY jp.id ASC
            `)
            .all<JobPowerWithJobRow>();

        return results.map((power) => ({
            id: power.id,
            name: power.name,
            description: power.description,
            type: power.type,
            max_level: power.max_level,
            is_global: Boolean(power.is_global),
            job_name: JSON.parse(power.job_name),
        }));
    }
}

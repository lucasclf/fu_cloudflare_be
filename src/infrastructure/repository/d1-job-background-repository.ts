import {
	CreateJobAliasInput,
	JobAlias,
} from "../../domain/jobs/job";
import {
	JobAliasAlreadyExistsError,
} from "../../domain/jobs/job-errors";

export class D1JobAliasesRepository {
	constructor(private readonly db: D1Database) {}

	async findByJobIds(
		jobIds: number[],
	): Promise<Map<number, JobAlias[]>> {
		if (jobIds.length === 0) {
			return new Map();
		}

		const placeholders = jobIds.map(() => "?").join(",");

		const { results } = await this.db
			.prepare(`
            SELECT
              id,
              job_id,
              alias
            FROM job_aliases
            WHERE job_id IN (${placeholders})
            ORDER BY job_id ASC, alias ASC
          `)
			.bind(...jobIds)
			.all<JobAlias>();

		const grouped = new Map<number, JobAlias[]>();

		for (const alias of results) {
			const current = grouped.get(alias.job_id) ?? [];
			current.push(alias);
			grouped.set(alias.job_id, current);
		}

		return grouped;
	}

	async create(input: CreateJobAliasInput): Promise<void> {
		try {
			await this.db
				.prepare(`
                INSERT INTO job_aliases (
                    job_id,
                    alias
                )
                VALUES (?, ?)
                `)
				.bind(input.job_id, input.alias)
				.run();
		} catch (error) {
			const message = error instanceof Error ? error.message : "";

			if (message.includes("UNIQUE constraint failed")) {
				throw new JobAliasAlreadyExistsError(input.alias, input.job_id);
			}

			throw error;
		}
	}
}

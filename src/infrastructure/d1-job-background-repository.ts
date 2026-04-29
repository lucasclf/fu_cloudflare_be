import {
	CreateJobAliasInput,
	CreateJobQuestionInput,
	JobAlias,
	JobQuestion,
} from "../domain/jobs/job";
import {
	JobAliasAlreadyExistsError,
	JobQuestionAlreadyExistsError,
} from "../domain/jobs/job-errors";

export class D1JobBackgroundRepository {
	constructor(private readonly db: D1Database) {}

	async findQuestionsByJobIds(
		jobIds: number[],
	): Promise<Map<number, JobQuestion[]>> {
		if (jobIds.length === 0) {
			return new Map();
		}

		const placeholders = jobIds.map(() => "?").join(",");

		const { results } = await this.db
			.prepare(`
            SELECT
              id,
              job_id,
              question,
              sort_order
            FROM job_questions
            WHERE job_id IN (${placeholders})
            ORDER BY job_id ASC, sort_order ASC, id ASC
          `)
			.bind(...jobIds)
			.all<JobQuestion>();

		const grouped = new Map<number, JobQuestion[]>();

		for (const question of results) {
			const current = grouped.get(question.job_id) ?? [];
			current.push(question);
			grouped.set(question.job_id, current);
		}

		return grouped;
	}

	async findAliasesByJobIds(
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

	async createJobQuestion(input: CreateJobQuestionInput): Promise<void> {
		try {
			await this.db
				.prepare(`
                  INSERT INTO job_questions (
                      job_id,
                      question,
                      sort_order
                  )
                  VALUES (?, ?, ?)
                  `)
				.bind(input.job_id, input.question, input.sort_order)
				.run();
		} catch (error) {
			const message = error instanceof Error ? error.message : "";

			if (message.includes("UNIQUE constraint failed")) {
				throw new JobQuestionAlreadyExistsError(input.job_id, input.question);
			}

			throw error;
		}
	}

	async createJobAlias(input: CreateJobAliasInput): Promise<void> {
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

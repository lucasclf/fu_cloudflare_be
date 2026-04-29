import {
	CreateJobSpellInput,
	JobSpell,
} from "../domain/jobs/job";
import {
	JobSpellAlreadyExistsError,
} from "../domain/jobs/job-errors";

export class D1JobSpellRepository {
	constructor(private readonly db: D1Database) {}

	async createJobSpell(input: CreateJobSpellInput): Promise<void> {
		try {
			await this.db
				.prepare(`
            INSERT INTO job_spells (
                name,
                description,
                job_id,
                is_offensive,
                cost,
                target,
                duration
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `)
				.bind(
					input.name,
					input.description,
					input.job_id,
					input.is_offensive,
					input.cost,
					input.target,
					input.duration,
				)
				.run();
		} catch (error) {
			const message = error instanceof Error ? error.message : "";

			if (message.includes("UNIQUE constraint failed")) {
				throw new JobSpellAlreadyExistsError(input.name);
			}

			throw error;
		}
	}

	async findSpellsByJobIds(
			jobIds: number[],
		): Promise<Map<number, JobSpell[]>> {
		if (jobIds.length === 0) {
			return new Map();
		}

		const placeholders = jobIds.map(() => "?").join(",");

		const { results } = await this.db
					.prepare(`
					SELECT
					  id,
					  job_id,
					  name,
					  description,
					  is_offensive,
					  cost,
					  target,
					  duration
					FROM job_spells
					WHERE job_id IN (${placeholders})
					ORDER BY job_id ASC, id ASC
				  `)
					.bind(...jobIds)
					.all<JobSpell>();
		
				const grouped = new Map<number, JobSpell[]>();
		
				for (const spell of results) {
					const current = grouped.get(spell.job_id) ?? [];
					current.push(spell);
					grouped.set(spell.job_id, current);
				}
		
				return grouped;
	}
}

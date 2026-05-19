
import { SpellAlreadyExistsError } from "../../domain/spells/spell-errors";
import { CreateJobSpellInput, JobSpell, JobSpellWithJob } from "../../domain/spells/spells";
import { D1Boolean, fromBoolean, uniqueNumbers, buildInPlaceholders, mapById, toBoolean } from "../d1-utils";
import { JobSpellWithJobEntity, JobSpellEntity } from "../entity/job";

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
					fromBoolean(input.is_offensive),
					input.cost,
					input.target,
					input.duration,
				)
				.run();
		} catch (error) {
			const message = error instanceof Error ? error.message : "";

			if (message.includes("UNIQUE constraint failed")) {
				throw new SpellAlreadyExistsError(input.name);
			}

			throw error;
		}
	}

	async listSpells(): Promise<JobSpellWithJob[]> {
		const { results } = await this.db
			.prepare(`
				SELECT
					js.id,
					js.job_id,
					j.name AS job_name,
					js.name,
					js.description,
					js.is_offensive,
					js.cost,
					js.target,
					js.duration
				FROM job_spells js
				INNER JOIN jobs j
					ON j.id = js.job_id
				ORDER BY j.name ASC, js.name ASC
			`)
			.all<JobSpellWithJobEntity>();

		return results.map((row) => this.toJobSpellWithJob(row));
	}

	async findSpellsByJobIds(
		jobIds: number[],
	): Promise<Map<number, JobSpell[]>> {
		if (jobIds.length === 0) {
			return new Map();
		}

		const uniqueJobIds = uniqueNumbers(jobIds);
		const placeholders = buildInPlaceholders(uniqueJobIds);

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
				ORDER BY job_id ASC, name ASC
			`)
			.bind(...uniqueJobIds)
			.all<JobSpellEntity>();

		const grouped = new Map<number, JobSpell[]>();

		for (const row of results) {
			const spell = this.toJobSpell(row);
			const current = grouped.get(row.job_id) ?? [];

			current.push(spell);
			grouped.set(row.job_id, current);
		}

		return grouped;
	}

	async findByIds(spellIds: number[]): Promise<Map<number, JobSpell>> {
		if (spellIds.length === 0) {
			return new Map();
		}

		const uniqueSpellIds = uniqueNumbers(spellIds);
		const placeholders = buildInPlaceholders(uniqueSpellIds);

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
				WHERE id IN (${placeholders})
				ORDER BY name ASC
			`)
			.bind(...uniqueSpellIds)
			.all<JobSpellEntity>();

		const spells = results.map((row) => this.toJobSpell(row));

		return mapById(spells);
	}

  	private toJobSpell(row: JobSpellEntity): JobSpell {
		return {
			id: row.id,
			job_id: row.job_id,
			name: row.name,
			description: row.description,
			is_offensive: toBoolean(row.is_offensive),
			cost: row.cost,
			target: row.target,
			duration: row.duration,
			nature: "job",
		};
	}

	private toJobSpellWithJob(row: JobSpellWithJobEntity): JobSpellWithJob {
		return {
			...this.toJobSpell(row),
			job_name: row.job_name,
		};
	}
}

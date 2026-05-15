import { CreateJobInput, Job, ResumeJob } from "../domain/jobs/job";
import { JobAlreadyExistsError } from "../domain/jobs/job-errors";

export class D1JobRepository {
	constructor(private readonly db: D1Database) {}

	async findAll(): Promise<Job[]> {
		const { results } = await this.db
			.prepare(`
            SELECT
              id,
              name,
              tagline,
              description,
              img_key,
              hp_bonus,
              mp_bonus,
              ip_bonus,
              allows_martial_armor,
              allows_martial_shield,
              allows_martial_ranged_weapon,
              allows_martial_melee_weapon,
              allows_arcane,
              allows_rituals,
              can_start_projects,
              allows_monster_spells,
              created_at,
              updated_at
            FROM jobs
            ORDER BY
              name ASC
          `)
			.all<Job>();

		return results;
	}

	async findCatalogJobs(): Promise<ResumeJob[]> {
		const { results } = await this.db
			.prepare(`
            SELECT
              id,
              name,
              tagline,
              img_key,
              hp_bonus,
              mp_bonus,
              ip_bonus,
              allows_martial_armor,
              allows_martial_shield,
              allows_martial_ranged_weapon,
              allows_martial_melee_weapon,
              allows_arcane,
              allows_rituals,
              allows_monster_spells,
              can_start_projects
            FROM jobs
            ORDER BY
              name ASC
          `)
			.all<Job>();

		return results;
	}

	async findByJobId(jobId: string): Promise<Job | null> {
		const result = await this.db
			.prepare(`
              SELECT
                id,
                name,
                tagline,
                description,
                img_key,
                hp_bonus,
                mp_bonus,
                ip_bonus,
                allows_martial_armor,
                allows_martial_shield,
                allows_martial_ranged_weapon,
                allows_martial_melee_weapon,
                allows_arcane,
                allows_rituals,
                allows_monster_spells,
                can_start_projects,
                created_at,
                updated_at
              FROM jobs
              WHERE id = ?
              LIMIT 1
            `)
			.bind(jobId)
			.first<Job>();

		return result;
	}

	async create(input: CreateJobInput): Promise<void> {
		try {
			await this.db
				.prepare(`
                INSERT INTO jobs (
                    name,
                    tagline,
                    description,
                    img_key,
                    hp_bonus,
                    mp_bonus,
                    ip_bonus,
                    allows_martial_armor,
                    allows_martial_shield,
                    allows_martial_ranged_weapon,
                    allows_martial_melee_weapon,
                    allows_arcane,
                    allows_rituals,
                    allows_monster_spells,
                    can_start_projects
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `)
				.bind(
					input.name,
					input.tagline,
					input.description,
					input.img_key,
					input.hp_bonus,
					input.mp_bonus,
					input.ip_bonus,
					input.allows_martial_armor,
					input.allows_martial_shield,
					input.allows_martial_ranged_weapon,
					input.allows_martial_melee_weapon,
					input.allows_arcane,
					input.allows_rituals,
					input.allows_monster_spells,
					input.can_start_projects,
				)
				.run();
		} catch (error) {
			const message = error instanceof Error ? error.message : "";

			if (message.includes("UNIQUE constraint failed")) {
				throw new JobAlreadyExistsError(input.name);
			}

			throw error;
		}
	}

  async findResumeByIds(jobIds: number[]): Promise<Map<number, ResumeJob>> {
    if (jobIds.length === 0) {
      return new Map();
    }

    const uniqueJobIds = [...new Set(jobIds)];
    const placeholders = uniqueJobIds.map(() => "?").join(",");

    const { results } = await this.db
      .prepare(`
        SELECT
          id,
          name,
          tagline,
          img_key,
          hp_bonus,
          mp_bonus,
          ip_bonus,
          allows_martial_armor,
          allows_martial_shield,
          allows_martial_ranged_weapon,
          allows_martial_melee_weapon,
          allows_arcane,
          allows_rituals,
          allows_monster_spells,
          can_start_projects
        FROM jobs
        WHERE id IN (${placeholders})
        ORDER BY name ASC
      `)
      .bind(...uniqueJobIds)
      .all<ResumeJob>();

    const jobsById = new Map<number, ResumeJob>();

    for (const job of results) {
      jobsById.set(job.id, {
        ...job,
        allows_martial_armor: Boolean(job.allows_martial_armor),
        allows_martial_shield: Boolean(job.allows_martial_shield),
        allows_martial_ranged_weapon: Boolean(job.allows_martial_ranged_weapon),
        allows_martial_melee_weapon: Boolean(job.allows_martial_melee_weapon),
        allows_arcane: Boolean(job.allows_arcane),
        allows_rituals: Boolean(job.allows_rituals),
        allows_monster_spells: Boolean(job.allows_monster_spells),
        can_start_projects: Boolean(job.can_start_projects),
      });
    }

    return jobsById;
  }
}

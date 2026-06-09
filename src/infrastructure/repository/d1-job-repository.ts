import { CreateJobInput, Job, ResumeJob } from "../../domain/jobs/job";
import { JobAlreadyExistsError } from "../../domain/jobs/job-errors";
import { buildInPlaceholders, D1Boolean, fromBoolean, mapById, toBoolean, uniqueNumbers } from "../d1-utils";
import { JobRow, ResumeJobRow } from "../rows/job";

export class D1JobRepository {
	constructor(private readonly db: D1Database) {}

	async findAll(globalOnly?: boolean): Promise<Job[]> {
		const globalFilter = globalOnly
			? "WHERE id NOT IN (SELECT entity_id FROM campaign_entities WHERE entity_type = 'job')"
			: "";
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
              can_cooking,
              created_at,
              updated_at
            FROM jobs
            ${globalFilter}
            ORDER BY
              name ASC
          `)
      .all<JobRow>();

    return results.map((row) => this.toJob(row));
	}

	async findAllSummary(globalOnly?: boolean): Promise<ResumeJob[]> {
		const globalFilter = globalOnly
			? "WHERE id NOT IN (SELECT entity_id FROM campaign_entities WHERE entity_type = 'job')"
			: "";
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
              can_start_projects,
              can_cooking
            FROM jobs
            ${globalFilter}
            ORDER BY
              name ASC
          `)
			.all<ResumeJobRow>();

    return results.map((row) => this.toResumeJob(row));
	}

	async findById(jobId: string): Promise<Job | null> {
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
                can_cooking,
                created_at,
                updated_at
              FROM jobs
              WHERE id = ?
              LIMIT 1
            `)
			.bind(jobId)
			.first<JobRow>();

    return result ? this.toJob(result) : null;
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
                    can_start_projects,
                    can_cooking
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `)
				.bind(
					input.name,
          input.tagline,
          input.description,
          input.img_key,
          input.hp_bonus,
          input.mp_bonus,
          input.ip_bonus,
          fromBoolean(input.allows_martial_armor),
          fromBoolean(input.allows_martial_shield),
          fromBoolean(input.allows_martial_ranged_weapon),
          fromBoolean(input.allows_martial_melee_weapon),
          fromBoolean(input.allows_arcane),
          fromBoolean(input.allows_rituals),
          fromBoolean(input.allows_monster_spells),
          fromBoolean(input.can_start_projects),
          fromBoolean(input.can_cooking),
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

  async findSummaryByIds(jobIds: number[]): Promise<Map<number, ResumeJob>> {
    if (jobIds.length === 0) {
      return new Map();
    }

    const uniqueJobIds = uniqueNumbers(jobIds);
    const placeholders = buildInPlaceholders(uniqueJobIds);

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
          can_start_projects,
          can_cooking
        FROM jobs
        WHERE id IN (${placeholders})
        ORDER BY name ASC
      `)
      .bind(...uniqueJobIds)
      .all<ResumeJobRow>();

    const jobs = results.map((row) => this.toResumeJob(row));

    return mapById(jobs);
  }

  private toJob(row: JobRow): Job {
    return {
        ...row,
        allows_martial_armor: toBoolean(row.allows_martial_armor),
        allows_martial_shield: toBoolean(row.allows_martial_shield),
        allows_martial_ranged_weapon: toBoolean(
            row.allows_martial_ranged_weapon,
        ),
        allows_martial_melee_weapon: toBoolean(
            row.allows_martial_melee_weapon,
        ),
        allows_arcane: toBoolean(row.allows_arcane),
        allows_rituals: toBoolean(row.allows_rituals),
        allows_monster_spells: toBoolean(row.allows_monster_spells),
        can_start_projects: toBoolean(row.can_start_projects),
        can_cooking: toBoolean(row.can_cooking),
    };
  }

  private toResumeJob(row: ResumeJobRow): ResumeJob {
    return {
        ...row,
        allows_martial_armor: toBoolean(row.allows_martial_armor),
        allows_martial_shield: toBoolean(row.allows_martial_shield),
        allows_martial_ranged_weapon: toBoolean(
            row.allows_martial_ranged_weapon,
        ),
        allows_martial_melee_weapon: toBoolean(
            row.allows_martial_melee_weapon,
        ),
        allows_arcane: toBoolean(row.allows_arcane),
        allows_rituals: toBoolean(row.allows_rituals),
        allows_monster_spells: toBoolean(row.allows_monster_spells),
        can_start_projects: toBoolean(row.can_start_projects),
        can_cooking: toBoolean(row.can_cooking),
    };
  }
}

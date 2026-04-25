import { CreateJobAliasInput, CreateJobInput, CreateJobQuestionInput, Job, JobAlias, JobFull, JobQuestion } from "../domain/jobs/job";
import { JobAliasAlreadyExistsError, JobAlreadyExistsError, JobQuestionAlreadyExistsError } from "../domain/jobs/job-errors";

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
              created_at,
              updated_at
            FROM jobs
            ORDER BY
              name ASC
          `)
			.all<Job>();

		return results;
	}

  async findAllFull(): Promise<JobFull[]> {
    const jobs = await this.findAll();

    if (jobs.length === 0) {
    return [];
    }

    const { results: questions } = await this.db
      .prepare(`
        SELECT
          id,
          job_id,
          question,
          sort_order
        FROM job_questions
        ORDER BY sort_order ASC, id ASC
      `)
      .all<JobQuestion>();
    
      const { results: aliases } = await this.db
      .prepare(`
        SELECT
          id,
          job_id,
          alias
        FROM job_aliases
        ORDER BY alias ASC
      `)
      .all<JobAlias>();
    
      const questionsByJobId = new Map<number, JobQuestion[]>();
      const aliasesByJobId = new Map<number, JobAlias[]>();

      for (const question of questions) {
      const currentQuestions = questionsByJobId.get(question.job_id) ?? [];
      currentQuestions.push(question);
      questionsByJobId.set(question.job_id, currentQuestions);
    }

    for (const alias of aliases) {
      const currentAliases = aliasesByJobId.get(alias.job_id) ?? [];
      currentAliases.push(alias);
      aliasesByJobId.set(alias.job_id, currentAliases);
    }

    return jobs.map((job) => ({
      ...job,
      questions: questionsByJobId.get(job.id) ?? [],
      aliases: aliasesByJobId.get(job.id) ?? [],
    }));
  }

	async findByJobName(jobName: string): Promise<Job | null> {
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
                can_start_projects,
                created_at,
                updated_at
              FROM jobs
              WHERE name = ?
              LIMIT 1
            `)
			.bind(jobName)
			.first<Job>();

		return result;
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

  async findByJobIdFull(jobId: string): Promise<JobFull | null> {
    const job = await this.findByJobId(jobId);
  
    if (!job) {
      return null;
    }

    const questions = await this.findJobQuestionsByJobId(jobId);

    const aliases = await this.findJobAliasesByJobId(jobId);

    return {
      ...job,
      questions,
      aliases,
    };
  }

  async findJobQuestionsByJobId(jobId: string): Promise<JobQuestion[]> {
    const { results } = await this.db
      .prepare(`
        SELECT
          id,
          job_id,
          question,
          sort_order
        FROM job_questions
        WHERE job_id = ?
        ORDER BY sort_order ASC, id ASC
      `)
      .bind(jobId)
      .all<JobQuestion>();

    return results;
  }

  async findJobAliasesByJobId(jobId: string): Promise<JobAlias[]> {
    const { results } = await this.db
      .prepare(`
        SELECT
          id,
          job_id,
          alias
        FROM job_aliases
        WHERE job_id = ?
        ORDER BY alias ASC
      `)
      .bind(jobId)
      .all<JobAlias>();

    return results;
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
                    can_start_projects
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
				.bind(
					input.job_id,
					input.question,
					input.sort_order,
				)
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
				.bind(
					input.job_id,
					input.alias,
				)
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

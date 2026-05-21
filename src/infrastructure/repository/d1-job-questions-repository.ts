import {
    CreateJobAliasInput,
    CreateJobQuestionInput,
    JobAlias,
    JobQuestion,
} from "../../domain/jobs/job";
import {
    JobAliasAlreadyExistsError,
    JobQuestionAlreadyExistsError,
} from "../../domain/jobs/job-errors";

export class D1JobQuestionsRepository {
    constructor(private readonly db: D1Database) {}

    async findByJobIds(
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

    async create(input: CreateJobQuestionInput): Promise<void> {
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
}

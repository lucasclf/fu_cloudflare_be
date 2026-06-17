import type { CreateSessionInput, UpdateSessionInput } from "../../domain/sessions/session";
import { SessionAlreadyExistsError } from "../../domain/sessions/session-errors";

export class D1SessionRepository {
	constructor(private readonly db: D1Database) {}

	async create(input: CreateSessionInput): Promise<number> {
		try {
			const result = await this.db
				.prepare(`
          INSERT INTO sessions (
            campaign_id,
            session_number,
            title,
            summary,
            notes,
            played_at
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `)
				.bind(
					input.campaign_id,
					input.session_number,
					input.title,
					input.summary,
					input.notes,
					input.played_at,
				)
				.run();

			return result.meta.last_row_id;
		} catch (error) {
			const message = error instanceof Error ? error.message : "";

			if (message.includes("UNIQUE constraint failed")) {
				throw new SessionAlreadyExistsError(input.session_number);
			}

			throw error;
		}
	}

	async update(id: number, input: UpdateSessionInput): Promise<void> {
		await this.db
			.prepare(`UPDATE sessions SET title = ?, summary = ?, notes = ?, played_at = ?, updated_at = datetime('now') WHERE id = ?`)
			.bind(input.title, input.summary, input.notes, input.played_at, id)
			.run();
	}
}

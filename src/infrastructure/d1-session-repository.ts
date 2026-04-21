import { CreateSessionInput, Session, UpdateSessionInput } from "../domain/session";
import { SessionAlreadyExistsError, SessionNotFoundError } from "../domain/session-errors";

export class D1SessionRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(): Promise<Session[]> {
    const { results } = await this.db
      .prepare(`
        SELECT
          id,
          session_number,
          title,
          summary,
          notes,
          played_at,
          created_at,
          updated_at
        FROM sessions
        ORDER BY session_number DESC
      `)
      .all<Session>();

    return results;
  }

  async findBySessionNumber(sessionNumber: number): Promise<Session | null> {
    const result = await this.db
      .prepare(`
        SELECT
          id,
          session_number,
          title,
          summary,
          notes,
          played_at,
          created_at,
          updated_at
        FROM sessions
        WHERE session_number = ?
        LIMIT 1
      `)
      .bind(sessionNumber)
      .first<Session>();

    return result ?? null;
  }

  async create(input: CreateSessionInput): Promise<void> {
    try {
      await this.db
        .prepare(`
          INSERT INTO sessions (
            session_number,
            title,
            summary,
            notes,
            played_at
          )
          VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          input.session_number,
          input.title,
          input.summary,
          input.notes,
          input.played_at
        )
        .run();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (message.includes("UNIQUE constraint failed")) {
        throw new SessionAlreadyExistsError(input.session_number);
      }

      throw error;
    }
  }

   async updateBySessionNumber(sessionNumber: number, input: UpdateSessionInput): Promise<void> {
    const existing = await this.findBySessionNumber(sessionNumber);

    if (!existing) {
      throw new SessionNotFoundError(sessionNumber);
    }

    await this.db
      .prepare(`
        UPDATE sessions
        SET
          title = ?,
          summary = ?,
          notes = ?,
          played_at = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE session_number = ?
      `)
      .bind(
        input.title,
        input.summary,
        input.notes,
        input.played_at,
        sessionNumber
      )
      .run();
  }

  async deleteBySessionNumber(sessionNumber: number): Promise<void> {
    const existing = await this.findBySessionNumber(sessionNumber);

    if (!existing) {
      throw new SessionNotFoundError(sessionNumber);
    }

    await this.db
      .prepare(`
        DELETE FROM sessions
        WHERE session_number = ?
      `)
      .bind(sessionNumber)
      .run();
  }
}

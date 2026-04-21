import { CreateSessionInput, Session, UpdateSessionInput } from "../domain/session";
import { D1SessionRepository } from "../infrastructure/d1-session-repository";

export class SessionService {
  constructor(private readonly repository: D1SessionRepository) {}

  async listSessions(): Promise<Session[]> {
    return this.repository.findAll();
  }

  async getSessionByNumber(sessionNumber: number): Promise<Session | null> {
    return this.repository.findBySessionNumber(sessionNumber);
  }

  async createSession(input: CreateSessionInput): Promise<void> {
    await this.repository.create(input);
  }

  async updateSession(sessionNumber: number, input: UpdateSessionInput): Promise<void> {
    await this.repository.updateBySessionNumber(sessionNumber, input);
  }

  async deleteSession(sessionNumber: number): Promise<void> {
    await this.repository.deleteBySessionNumber(sessionNumber);
  }
}
import type { CreateSessionInput } from "../domain/sessions/session";
import type { D1SessionRepository } from "../infrastructure/repository/d1-session-repository";

export class SessionService {
	constructor(private readonly repository: D1SessionRepository) {}

	async createSession(input: CreateSessionInput): Promise<number> {
		return await this.repository.create(input);
	}
}

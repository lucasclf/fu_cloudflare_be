import type { CreateSessionInput, UpdateSessionInput } from "../domain/sessions/session";
import type { D1SessionRepository } from "../infrastructure/repository/d1-session-repository";

export class SessionService {
	constructor(private readonly repository: D1SessionRepository) {}

	async createSession(input: CreateSessionInput): Promise<number> {
		return await this.repository.create(input);
	}

	async updateSession(id: number, input: UpdateSessionInput): Promise<void> {
		await this.repository.update(id, input);
	}
}

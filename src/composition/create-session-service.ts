import type { Env } from "../types/env";
import { D1SessionRepository } from "../infrastructure/d1-session-repository";
import { SessionService } from "../application/session-service";

export function createSessionService(env: Env): SessionService {
  const repository = new D1SessionRepository(env.fabula_ultima_db);
  return new SessionService(repository);
}
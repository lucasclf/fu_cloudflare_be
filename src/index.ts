import { SessionService } from "./application/session-service";
import { D1SessionRepository } from "./infrastructure/d1-session-repository";
import { isAuthorized } from "./presentation/auth";
import { unauthorized } from "./presentation/http";
import { SessionHandler } from "./presentation/session-handler";
import { Env } from "./types/env";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!isAuthorized(request, env)) {
      return unauthorized();
    }

    const repository = new D1SessionRepository(env.fabula_ultima_db);
    const service = new SessionService(repository);
    const handler = new SessionHandler(service);

    return handler.handle(request);
  },
};
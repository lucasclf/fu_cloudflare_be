import { UserService } from "../application/user-service";
import { D1UserRepository } from "../infrastructure/repository/d1-user-repository";
import type { Env } from "../types/env";

export function createUserService(env: Env): UserService {
    const userRepository = new D1UserRepository(env.fabula_ultima_db);
    return new UserService(userRepository, env.JWT_SECRET);
}

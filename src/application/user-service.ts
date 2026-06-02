import type { AuthResult, CreateUserInput, LoginInput, User } from "../domain/users/user";
import { UserNotFoundError } from "../domain/users/user-errors";
import { hashPassword, verifyPassword } from "../utils/password";
import { signJwt } from "../utils/jwt";
import type { UserRepositoryPort } from "./ports/user-ports";

export class UserService {
    constructor(
        private readonly userRepository: UserRepositoryPort,
        private readonly jwtSecret: string,
    ) {}

    async listUsers(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    async createUser(input: CreateUserInput): Promise<void> {
        const password_hash = await hashPassword(input.password);
        await this.userRepository.create({
            email: input.email,
            display_name: input.display_name,
            password_hash,
            is_super_user: input.is_super_user,
        });
    }

    async deleteUser(id: string): Promise<void> {
        const user = await this.userRepository.findById(id);
        if (!user) throw new UserNotFoundError(id);
        await this.userRepository.delete(id);
    }

    async login(input: LoginInput): Promise<AuthResult | null> {
        const storedHash = await this.userRepository.findPasswordHashByEmail(input.email);

        if (!storedHash) {
            await verifyPassword(input.password, "pbkdf2:100000:dW5rbm93bg:dW5rbm93bg");
            return null;
        }

        const valid = await verifyPassword(input.password, storedHash);
        if (!valid) return null;

        const user = await this.userRepository.findByEmail(input.email);
        if (!user) return null;

        const token = await signJwt(
            { sub: user.id, email: user.email, is_super_user: user.is_super_user },
            this.jwtSecret,
        );

        return { token, user };
    }
}

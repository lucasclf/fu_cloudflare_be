import type { User } from "../../domain/users/user";
import { NicknameAlreadyTakenError, UserAlreadyExistsError } from "../../domain/users/user-errors";
import type {
    CreateUserRepositoryInput,
    UserRepositoryPort,
} from "../../application/ports/user-ports";
import { fromBoolean, toBoolean } from "../d1-utils";

type UserRow = {
    id: number;
    email: string;
    name: string;
    nickname: string;
    img_key: string | null;
    password_hash: string;
    is_super_user: 0 | 1;
    created_at: string;
    updated_at: string | null;
};

const SELECT_FIELDS = "id, email, name, nickname, img_key, is_super_user, created_at, updated_at";

export class D1UserRepository implements UserRepositoryPort {
    constructor(private readonly db: D1Database) {}

    async findAll(): Promise<User[]> {
        const { results } = await this.db
            .prepare(`SELECT ${SELECT_FIELDS} FROM users ORDER BY created_at ASC`)
            .all<Omit<UserRow, "password_hash">>();
        return results.map((row) => this.toUser(row));
    }

    async findById(id: string): Promise<User | null> {
        const result = await this.db
            .prepare(`SELECT ${SELECT_FIELDS} FROM users WHERE id = ? LIMIT 1`)
            .bind(id)
            .first<Omit<UserRow, "password_hash">>();
        return result ? this.toUser(result) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await this.db
            .prepare(`SELECT ${SELECT_FIELDS} FROM users WHERE email = ? LIMIT 1`)
            .bind(email)
            .first<Omit<UserRow, "password_hash">>();
        return result ? this.toUser(result) : null;
    }

    async findPasswordHashByEmail(email: string): Promise<string | null> {
        const result = await this.db
            .prepare("SELECT password_hash FROM users WHERE email = ? LIMIT 1")
            .bind(email)
            .first<{ password_hash: string }>();
        return result?.password_hash ?? null;
    }

    async create(input: CreateUserRepositoryInput): Promise<void> {
        try {
            await this.db
                .prepare(`
                    INSERT INTO users (email, name, nickname, img_key, password_hash, is_super_user)
                    VALUES (?, ?, ?, ?, ?, ?)
                `)
                .bind(
                    input.email,
                    input.name,
                    input.nickname,
                    input.img_key,
                    input.password_hash,
                    fromBoolean(input.is_super_user),
                )
                .run();
        } catch (error) {
            const message = error instanceof Error ? error.message : "";
            if (message.includes("UNIQUE constraint failed")) {
                if (message.includes("users.nickname")) {
                    throw new NicknameAlreadyTakenError(input.nickname);
                }
                throw new UserAlreadyExistsError(input.email);
            }
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        await this.db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
    }

    private toUser(row: Omit<UserRow, "password_hash">): User {
        return {
            ...row,
            is_super_user: toBoolean(row.is_super_user),
        };
    }
}

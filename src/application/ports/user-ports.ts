import type { User } from "../../domain/users/user";

export interface CreateUserRepositoryInput {
    email: string;
    display_name: string | null;
    password_hash: string;
    is_super_user: boolean;
}

export interface UserReaderPort {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findPasswordHashByEmail(email: string): Promise<string | null>;
}

export interface UserWriterPort {
    create(input: CreateUserRepositoryInput): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface UserRepositoryPort extends UserReaderPort, UserWriterPort {}

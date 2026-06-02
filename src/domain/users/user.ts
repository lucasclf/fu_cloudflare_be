export interface User {
    id: number;
    email: string;
    display_name: string | null;
    is_super_user: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface CreateUserInput {
    email: string;
    display_name: string | null;
    password: string;
    is_super_user: boolean;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResult {
    token: string;
    user: User;
}

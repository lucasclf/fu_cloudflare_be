export interface User {
    id: number;
    email: string;
    name: string;
    nickname: string;
    img_key: string | null;
    is_super_user: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface CreateUserInput {
    email: string;
    name: string;
    nickname: string;
    img_key: string | null;
    password: string;
    is_super_user: boolean;
}

// Cadastro público — nunca inclui is_super_user nem img_key (ver registerUserSchema).
export interface RegisterUserInput {
    email: string;
    name: string;
    nickname: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResult {
    token: string;
    user: User;
}

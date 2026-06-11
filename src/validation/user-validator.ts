import type { CreateUserInput, LoginInput } from "../domain/users/user";
import {
    ensureObject,
    readBooleanWithDefault,
    readOptionalString,
    readRequiredString,
} from "./generic-validator";

export function validateCreateUserInput(input: unknown): CreateUserInput {
    const raw = ensureObject(input);

    return {
        email: readRequiredString(raw, "email"),
        name: readRequiredString(raw, "name"),
        nickname: readRequiredString(raw, "nickname"),
        img_key: readOptionalString(raw, "img_key"),
        password: readRequiredString(raw, "password"),
        is_super_user: readBooleanWithDefault(raw, "is_super_user", false),
    };
}

export function validateLoginInput(input: unknown): LoginInput {
    const raw = ensureObject(input);

    return {
        identifier: readRequiredString(raw, "identifier"),
        password: readRequiredString(raw, "password"),
    };
}

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
        display_name: readOptionalString(raw, "display_name"),
        password: readRequiredString(raw, "password"),
        is_super_user: readBooleanWithDefault(raw, "is_super_user", false),
    };
}

export function validateLoginInput(input: unknown): LoginInput {
    const raw = ensureObject(input);

    return {
        email: readRequiredString(raw, "email"),
        password: readRequiredString(raw, "password"),
    };
}

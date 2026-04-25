import { ValidationError } from "../domain/domain-errors";

type RawInput = Record<string, unknown>;


export function ensureObject(input: unknown): RawInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ValidationError("Request body must be a valid object");
  }

  return input as RawInput;
}

export function readRequiredString(
  input: RawInput,
  fieldName: string,
): string {
  const value = input[fieldName];

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    throw new ValidationError(`${fieldName} is required`);
  }

  return normalizedValue;
}

export function readOptionalString(
  input: RawInput,
  fieldName: string,
): string | null {
  const value = input[fieldName];

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

export function readNumberWithDefault(  
  input: RawInput,
  fieldName: string,
) {
  
  const value = input[fieldName];
  
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  if (!Number.isInteger(value)) {
    throw new ValidationError(`${fieldName} must be an integer`);
  }

  return value;
}
export function readRequiredNumber(
  input: RawInput,
  fieldName: string,
): number {
  const value = input[fieldName];

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  if (!Number.isInteger(value)) {
    throw new ValidationError(`${fieldName} must be an integer`);
  }

  return value;
}

export function readBooleanWithDefault(
  input: RawInput,
  fieldName: string,
  defaultValue: boolean,
): boolean {
  const value = input[fieldName];

  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== "boolean") {
    throw new ValidationError(`${fieldName} must be a boolean`);
  }

  return value;
}
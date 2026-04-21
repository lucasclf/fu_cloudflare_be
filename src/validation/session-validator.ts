import { CreateSessionInput, UpdateSessionInput } from "../domain/session";
import { ValidationError } from "../domain/session-errors";

type RawSessionInput = {
  session_number?: unknown;
  title?: unknown;
  summary?: unknown;
  notes?: unknown;
  played_at?: unknown;
};

const MAX_TITLE_LENGTH = 120;
const MAX_SUMMARY_LENGTH = 10_000;
const MAX_NOTES_LENGTH = 100_000;

function normalizeOptionalString(value: unknown, fieldName: string, maxLength: number): string | null {
  if (value === undefined || value === null) return null;

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const normalized = value.trim();

  if (normalized.length === 0) return null;

  if (normalized.length > maxLength) {
    throw new ValidationError(`${fieldName} exceeds max length of ${maxLength}`);
  }

  return normalized;
}

function normalizeRequiredString(value: unknown, fieldName: string, maxLength: number): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new ValidationError(`${fieldName} is required`);
  }

  if (normalized.length > maxLength) {
    throw new ValidationError(`${fieldName} exceeds max length of ${maxLength}`);
  }

  return normalized;
}

function validateSessionNumber(value: unknown): number {
  if (!Number.isInteger(value)) {
    throw new ValidationError("session_number must be an integer");
  }

  if ((value as number) < 0) {
    throw new ValidationError("session_number must be greater or equal than zero");
  }

  return value as number;
}

function validatePlayedAt(value: unknown): string {
  const playedAt = normalizeRequiredString(value, "played_at", 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(playedAt)) {
    throw new ValidationError("played_at must be in YYYY-MM-DD format");
  }

  const date = new Date(`${playedAt}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError("played_at is not a valid date");
  }

  return playedAt;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateCreateSessionInput(raw: unknown): CreateSessionInput {
  if (!isObject(raw)) {
    throw new ValidationError("Request body must be a JSON object");
  }

  const input: RawSessionInput = raw;

  return {
    session_number: validateSessionNumber(input.session_number),
    title: normalizeOptionalString(input.title, "title", MAX_TITLE_LENGTH),
    summary: normalizeRequiredString(input.summary, "summary", MAX_SUMMARY_LENGTH),
    notes: normalizeOptionalString(input.notes, "notes", MAX_NOTES_LENGTH),
    played_at: validatePlayedAt(input.played_at),
  };
}

export function validateUpdateSessionInput(raw: unknown): UpdateSessionInput {
  if (!isObject(raw)) {
    throw new ValidationError("Request body must be a JSON object");
  }

  const input: RawSessionInput = raw;

  return {
    title: normalizeOptionalString(input.title, "title", MAX_TITLE_LENGTH),
    summary: normalizeRequiredString(input.summary, "summary", MAX_SUMMARY_LENGTH),
    notes: normalizeOptionalString(input.notes, "notes", MAX_NOTES_LENGTH),
    played_at: validatePlayedAt(input.played_at),
  };
}
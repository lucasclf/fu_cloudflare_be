import { ValidationError } from "../domain/domain-errors";
import type {
	CreateSessionInput,
	UpdateSessionInput,
} from "../domain/sessions/session";
import {
	ensureObject,
	readOptionalString,
	readRequiredNumber,
	readRequiredString,
} from "./generic-validator";

function validateSessionNumber(raw: Record<string, unknown>): number {
	const sessionNumber = readRequiredNumber(raw, "session_number");

	if (sessionNumber < 0) {
		throw new ValidationError(
			"session_number must be greater or equal than zero",
		);
	}

	return sessionNumber;
}

function validatePlayedAt(raw: Record<string, unknown>): string {
	const playedAt = readRequiredString(raw, "played_at");

	if (!/^\d{4}-\d{2}-\d{2}$/.test(playedAt)) {
		throw new ValidationError("played_at must be in YYYY-MM-DD format");
	}

	const date = new Date(`${playedAt}T00:00:00Z`);

	if (Number.isNaN(date.getTime())) {
		throw new ValidationError("played_at is not a valid date");
	}

	return playedAt;
}

export function validateCreateSessionInput(
	input: unknown,
): CreateSessionInput {
	const raw = ensureObject(input);

	return {
		session_number: validateSessionNumber(raw),
		title: readOptionalString(
			raw,
			"title",
		),
		summary: readRequiredString(
			raw,
			"summary",
		),
		notes: readOptionalString(
			raw,
			"notes",
		),
		played_at: validatePlayedAt(raw),
	};
}

export function validateUpdateSessionInput(
	input: unknown,
): UpdateSessionInput {
	const raw = ensureObject(input);

	return {
		title: readOptionalString(
			raw,
			"title",
		),
		summary: readRequiredString(
			raw,
			"summary",
		),
		notes: readOptionalString(
			raw,
			"notes",
		),
		played_at: validatePlayedAt(raw),
	};
}
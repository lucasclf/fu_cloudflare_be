import {
	ALLOWED_POWER_TYPE,
	CreateJobAliasInput,
	CreateJobInput,
	CreateJobPowerInput,
	CreateJobQuestionInput,
	CreateJobSpellInput,
} from "../domain/jobs/job";
import {
	ensureObject,
	readBooleanWithDefault,
	readNumberWithDefault,
	readOptionalString,
	readRequiredNumber,
	readRequiredPositiveIntegerArray,
	readRequiredString,
	validateStringEnum,
} from "./generic-validator";

export function validateCreateJobInput(input: unknown): CreateJobInput {
	const raw = ensureObject(input);

	return {
		name: readRequiredString(raw, "name"),
		tagline: readRequiredString(raw, "tagline"),
		description: readRequiredString(raw, "description"),
		img_key: readOptionalString(raw, "img_key"),

		hp_bonus: readNumberWithDefault(raw, "hp_bonus"),
		mp_bonus: readNumberWithDefault(raw, "mp_bonus"),
		ip_bonus: readNumberWithDefault(raw, "ip_bonus"),

		allows_martial_armor: readBooleanWithDefault(
			raw,
			"allows_martial_armor",
			false,
		),
		allows_martial_shield: readBooleanWithDefault(
			raw,
			"allows_martial_shield",
			false,
		),
		allows_martial_ranged_weapon: readBooleanWithDefault(
			raw,
			"allows_martial_ranged_weapon",
			false,
		),
		allows_martial_melee_weapon: readBooleanWithDefault(
			raw,
			"allows_martial_melee_weapon",
			false,
		),
		allows_arcane: readBooleanWithDefault(raw, "allows_arcane", false),
		allows_rituals: readBooleanWithDefault(raw, "allows_rituals", false),
		can_start_projects: readBooleanWithDefault(
			raw,
			"can_start_projects",
			false,
		),
	};
}

export function validateCreateJobQuestionsInput(
	input: unknown,
): CreateJobQuestionInput {
	const raw = ensureObject(input);

	return {
		job_id: readRequiredNumber(raw, "job_id"),
		question: readRequiredString(raw, "question"),
		sort_order: readRequiredNumber(raw, "sort_order"),
	};
}

export function validateCreateJobAliasesInput(
	input: unknown,
): CreateJobAliasInput {
	const raw = ensureObject(input);

	return {
		job_id: readRequiredNumber(raw, "job_id"),
		alias: readRequiredString(raw, "alias"),
	};
}

export function validateCreateJobPowersInput(
	input: unknown,
): CreateJobPowerInput {
	const raw = ensureObject(input);

	return {
		job_id: readRequiredPositiveIntegerArray(raw, "job_id"),
		name: readRequiredString(raw, "name"),
		description: readRequiredString(raw, "description"),
		type: validateStringEnum(raw.type, "type", ALLOWED_POWER_TYPE),
		max_level: readRequiredNumber(raw, "max_level"),
		is_global: readBooleanWithDefault(raw, "is_global", false),
	};
}

export function validateCreateJobSpellsInput(
	input: unknown,
): CreateJobSpellInput {
	const raw = ensureObject(input);

	return {
		job_id: readRequiredNumber(raw, "job_id"),
		name: readRequiredString(raw, "name"),
		description: readRequiredString(raw, "description"),
		is_offensive: readBooleanWithDefault(raw, "is_offensive", false),
		cost: readRequiredString(raw, "cost"),
		target: readRequiredString(raw, "target"),
		duration: readRequiredString(raw, "duration"),
	};
}

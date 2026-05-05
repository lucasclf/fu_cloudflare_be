import { CreateJobSpellInput, CreateMonsterSpellInput } from "../domain/spells/spells";
import { ensureObject, readBooleanWithDefault, readRequiredNumber, readRequiredString } from "./generic-validator";

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

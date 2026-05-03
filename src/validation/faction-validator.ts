import { ALLOWED_FACTION_LOCATION_RELATION_TYPES, ALLOWED_FACTION_TYPES, CreateFactionInput, CreateFactionLocationRelation } from "../domain/factions/faction";
import { ensureObject, readOptionalString, readRequiredNumber, readRequiredPositiveIntegerArray, readRequiredString, validateStringEnum } from "./generic-validator";


export function validateCreateFactionsInput( 
input: unknown,
): CreateFactionInput {
    const raw = ensureObject(input);

    return {
        name: readRequiredString(raw, "name"),
        description: readRequiredString(raw, "description"),
        tagline: readRequiredString(raw, "tagline"),
        img_key: readOptionalString(raw, "img_key"),
        faction_type: validateStringEnum(raw.faction_type, "faction_type", ALLOWED_FACTION_TYPES),
        faction_location_relation: validateFactionLocationRelation(raw, "faction_location_relation"),
    };
}

function validateFactionLocationRelation(
	raw: Record<string, unknown>,
	fieldName: string,
): CreateFactionLocationRelation[] {
	const value = raw[fieldName];

	if (!Array.isArray(value)) {
		throw new Error(`Campo ${fieldName} deve ser uma lista`);
	}

	if (value.length === 0) {
		throw new Error(`Campo ${fieldName} deve possuir pelo menos uma relação`);
	}

	return value.map((item, index) => {
		const relation = ensureObject(item);

		return {
			location_id: readRequiredNumber(
				relation,
				`location_id`,
			),
			relation_type: validateStringEnum(
				relation.relation_type,
				`relation_type`,
				ALLOWED_FACTION_LOCATION_RELATION_TYPES,
			),
		};
	});
}

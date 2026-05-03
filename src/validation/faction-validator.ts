import { ALLOWED_FACTION_TYPES, CreateFactionInput } from "../domain/factions/faction";
import { ensureObject, readOptionalString, readRequiredPositiveIntegerArray, readRequiredString, validateStringEnum } from "./generic-validator";


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
        locations_id: readRequiredPositiveIntegerArray(raw, "locations_id"),
    };
}

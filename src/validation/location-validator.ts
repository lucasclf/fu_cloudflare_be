import { ALLOWED_LOCATION_TYPES, CreateLocationInput } from "../domain/locations/location";
import { ensureObject, readOptionalString, readRequiredNumber, readRequiredString, validateStringEnum } from "./generic-validator";

export function validateCreateLocationsInput(
    input: unknown,
): CreateLocationInput {
    const raw = ensureObject(input);

    return {
        name: readRequiredString(raw, "name"),
        description: readRequiredString(raw, "description"),
        tagline: readRequiredString(raw, "tagline"),
        img_key: readOptionalString(raw, "img_key"),
        location_type: validateStringEnum(raw.location_type, "location_type", ALLOWED_LOCATION_TYPES),
    };
}
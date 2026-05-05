import { ALLOWED_ATTRIBUTE_DIE } from "../domain/domain-types";
import { ALLOWED_MONSTER_TYPE, CreateMonsterInput, CreateMonsterTraitInput } from "../domain/monsters/monster";
import { ensureObject, readOptionalNumber, readOptionalString, readRequiredNumber, readRequiredString, validateStringEnum } from "./generic-validator";

export function validateCreateMonsterInput (input: any): CreateMonsterInput {
    const raw = ensureObject(input);

    return {
        name: readRequiredString(raw, "name"),
        description: readRequiredString(raw, "description"),
        level: readRequiredNumber(raw, "level"),
        dexterity_die: validateStringEnum(raw.dexterity_die, "dexterity_die", ALLOWED_ATTRIBUTE_DIE),
        insight_die: validateStringEnum(raw.insight_die, "insight_die", ALLOWED_ATTRIBUTE_DIE),
        might_die: validateStringEnum(raw.might_die, "might_die", ALLOWED_ATTRIBUTE_DIE),
        willpower_die: validateStringEnum(raw.willpower_die, "willpower_die", ALLOWED_ATTRIBUTE_DIE),
        hp: readRequiredNumber(raw, "hp"),
        crisis_hp: readRequiredNumber(raw, "crisis_hp"),
        mp: readRequiredNumber(raw, "mp"),
        initiative: readRequiredNumber(raw, "initiative"),
        defense: readRequiredNumber(raw, "defense"),
        magic_defense: readRequiredNumber(raw, "magic_defense"),
        img_key: readOptionalString(raw, "img_key"),
        monster_type: validateStringEnum(raw.monster_type, "monster_type", ALLOWED_MONSTER_TYPE),
        equipment: readOptionalString(raw, "img_key"),
        source_page: readOptionalNumber(raw, "source_page")
    }
}

export function validateCreateTraitInput(input: Any): CreateMonsterTraitInput {
    const raw = ensureObject(input);

    return {
        monster_id: readRequiredNumber(raw, "monster_id"),
        trait: readRequiredString(raw, "trait")
    }
}
import { ALLOWED_ATTRIBUTE_DIE } from "../domain/domain-types";
import { ALLOWED_MONSTER_ACTION_ICON, ALLOWED_MONSTER_ACTION_TYPE, ALLOWED_MONSTER_AFFINITY, ALLOWED_MONSTER_DAMAGE_TYPE, ALLOWED_MONSTER_TYPE, CreateActionInput, CreateAffinityInput, CreateMonsterInput, CreateMonsterTraitInput } from "../domain/monsters/monster";
import { ensureObject, readBooleanWithDefault, readOptionalNumber, readOptionalString, readRequiredNumber, readRequiredString, validateNullableStringEnum, validateStringEnum } from "./generic-validator";

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

export function validateCreateTraitInput(input: any): CreateMonsterTraitInput {
    const raw = ensureObject(input);

    return {
        monster_id: readRequiredNumber(raw, "monster_id"),
        trait: readRequiredString(raw, "trait")
    }
}

export function validateCreateAffinitiesInput(input: any): CreateAffinityInput {
    const raw = ensureObject(input);

    return {
        monster_id: readRequiredNumber(raw, "monster_id"),
        physical: validateStringEnum(raw.physical, "physical", ALLOWED_MONSTER_AFFINITY),
        air: validateStringEnum(raw.air, "air", ALLOWED_MONSTER_AFFINITY),
        bolt: validateStringEnum(raw.bolt, "bolt", ALLOWED_MONSTER_AFFINITY),
        dark: validateStringEnum(raw.dark, "dark", ALLOWED_MONSTER_AFFINITY),
        earth: validateStringEnum(raw.earth, "earth", ALLOWED_MONSTER_AFFINITY),
        fire: validateStringEnum(raw.fire, "fire", ALLOWED_MONSTER_AFFINITY),
        ice: validateStringEnum(raw.ice, "ice", ALLOWED_MONSTER_AFFINITY),
        light: validateStringEnum(raw.light, "light", ALLOWED_MONSTER_AFFINITY),
        poison: validateStringEnum(raw.poison, "poison", ALLOWED_MONSTER_AFFINITY),
    }
}

export function validateCreateActionsInput(input: any): CreateActionInput {
    const raw = ensureObject(input)

    return {
        monster_id: readRequiredNumber(raw, "monster_id"),
        action_type: validateStringEnum(raw.action_type, "action_type", ALLOWED_MONSTER_ACTION_TYPE),
        action_icon: validateNullableStringEnum(raw.action_icon, "action_icon", ALLOWED_MONSTER_ACTION_ICON),
        name: readRequiredString(raw, "name"),
        description: readRequiredString(raw, "description"),
        check_formula: readOptionalString(raw, "check_formula"),
        accuracy_bonus: readOptionalNumber(raw, "accuracy_bonus"),
        damage_type: validateNullableStringEnum(raw.damage_type, "damage_type", ALLOWED_MONSTER_DAMAGE_TYPE),
        cost: readOptionalString(raw, "cost"),
        target: readOptionalString(raw, "target"),
        duration: readOptionalString(raw, "duration"),
        is_offensive: readBooleanWithDefault(raw, "is_offensive", false)
    }
}
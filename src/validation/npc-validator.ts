import { ALLOWED_ATTRIBUTE_DIE } from "../domain/domain-types";
import { ALLOWED_EQUIPMENT_SLOT_TYPE, ALLOWED_INVENTORY_TYPE, ALLOWED_SPECIAL_RULES_TYPE, CreateNpcEquipmentInput, CreateNpcInput, CreateNpcInventoryInput, CreateSpecialRulesInput } from "../domain/npc/npc";
import { ensureObject, readOptionalMetadata, readOptionalNumber, readOptionalString, readRequiredNumber, readRequiredString, validateStringEnum, validateStringNullabeEnum } from "./generic-validator";

export function validateCreateNpcInput(input: unknown): CreateNpcInput {
    const raw = ensureObject(input)

    return {
        name: readRequiredString(raw, "name"),
        description: readRequiredString(raw, "description"),
        tagline: readOptionalString(raw, "tagline"),
        level: readOptionalNumber(raw, "level"),
        dexterity_die: validateStringNullabeEnum(raw.dexterity_die, "dexterity_die", ALLOWED_ATTRIBUTE_DIE),
        insight_die: validateStringNullabeEnum(raw.insight_die, "insight_die", ALLOWED_ATTRIBUTE_DIE),
        might_die: validateStringNullabeEnum(raw.might_die, "might_die", ALLOWED_ATTRIBUTE_DIE),
        willpower_die: validateStringNullabeEnum(raw.willpower_die, "willpower_die", ALLOWED_ATTRIBUTE_DIE),
        hp: readOptionalNumber(raw, "hp"),
        mp: readOptionalNumber(raw, "mp"),
        initiative: readOptionalNumber(raw, "initiative"),
        defense: readOptionalNumber(raw, "defense"),
        magic_defense: readOptionalNumber(raw, "magic_defense"),
        img_key: readOptionalString(raw, "img_key"),
    }
}

export function validateCreateNpcSpecialRulesInput(input: unknown): CreateSpecialRulesInput {
    const raw = ensureObject(input)

    return {
        npc_id: readRequiredNumber(raw, "npc_id"),
        type: validateStringEnum(raw.type, "type", ALLOWED_SPECIAL_RULES_TYPE),
        title: readRequiredString(raw, "title"),
        description: readRequiredString(raw, "description"),
        metadata: readOptionalMetadata(raw, "metadata"),
    }
}

export function validateCreateNpcInventoryInput(input: unknown): CreateNpcInventoryInput {
    const raw = ensureObject(input)

    return {
        npc_id: readRequiredNumber(raw, "npc_id"),
        item_id: readRequiredNumber(raw, "item_id"),
        relation_type: validateStringEnum(raw.relation_type, "relation_type", ALLOWED_INVENTORY_TYPE),
        quantity: readRequiredNumber(raw, "quantity"),
    }
}

export function validateCreateNpcEquipmentInput(input: unknown): CreateNpcEquipmentInput {
    const raw = ensureObject(input)

    return {
        npc_id: readRequiredNumber(raw, "npc_id"),
        item_id: readRequiredNumber(raw, "item_id"),
        slot: validateStringEnum(raw.slot, "slot", ALLOWED_EQUIPMENT_SLOT_TYPE),
    }
}
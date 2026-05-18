import { ALLOWED_ATTRIBUTE_DIE } from "../domain/domain-types";
import { ALLOWED_BOND_ADMIRATION, ALLOWED_BOND_AFFECTION, ALLOWED_BOND_LOYALTY, ALLOWED_BOND_TARGET_TYPE, CreatePcArcanaRelationInput, PcBondInput, CreatePcEquipmentInput, CreatePCInput, CreatePcInventoryInput, PcJobRelation, CreatePcMonsterSpellRelationInput, PcPowerRelation, CreatePcSpellRelationInput } from "../domain/pc/pc";
import { ensureObject, readNumberWithDefault, readOptionalNumber, readOptionalString, readRequiredNumber, readRequiredString, validateStringEnum, validateStringNullabeEnum } from "./generic-validator";

export function validateCreatePcInput(input: unknown): CreatePCInput {
    const raw = ensureObject(input)
    
    return {
        name: readRequiredString(raw, "name"),
        description: readRequiredString(raw, "description"),
        tagline: readOptionalString(raw, "tagline"),
        dexterity_die: validateStringEnum(raw.dexterity_die, "dexterity_die", ALLOWED_ATTRIBUTE_DIE),
        insight_die: validateStringEnum(raw.insight_die, "insight_die", ALLOWED_ATTRIBUTE_DIE),
        might_die: validateStringEnum(raw.might_die, "might_die", ALLOWED_ATTRIBUTE_DIE),
        willpower_die: validateStringEnum(raw.willpower_die, "willpower_die", ALLOWED_ATTRIBUTE_DIE),
        img_key: readOptionalString(raw, "img_key"),
        pronouns: readOptionalString(raw, "pronouns"),
        origin: readRequiredString(raw, "origin"),
        identity: readRequiredString(raw, "identity"),
        theme: readRequiredString(raw, "theme"),
        money: readNumberWithDefault(raw, "money")
    }
}

export function validateCreatePcJobRelationInput(input: unknown): PcJobRelation {
    const raw = ensureObject(input)

    return {
        pc_id: readRequiredNumber(raw, "pc_id"),
        job_id: readRequiredNumber(raw, "job_id"),
        level: readRequiredNumber(raw, "level"),
    }
}

export function validateCreatePcPowerRelationInput(input: unknown): PcPowerRelation {
    const raw = ensureObject(input)

    return {
        pc_id: readRequiredNumber(raw, "pc_id"),
        power_id: readRequiredNumber(raw, "power_id"),
        level: readRequiredNumber(raw, "level"),
    }
}

export function validateCreatePcSpellRelationInput(input: unknown): CreatePcSpellRelationInput {
    const raw = ensureObject(input)

    return {
        pc_id: readRequiredNumber(raw, "pc_id"),
        spell_id: readRequiredNumber(raw, "spell_id"),
    }
}

export function validateCreatePcMonsterSpellRelationInput(input: unknown): CreatePcMonsterSpellRelationInput {
    const raw = ensureObject(input)

    return {
        pc_id: readRequiredNumber(raw, "pc_id"),
        monster_action_id: readRequiredNumber(raw, "monster_action_id"),
    }
}

export function validateCreatePcArcanaRelationInput(input: unknown): CreatePcArcanaRelationInput {
    const raw = ensureObject(input)

    return {
        pc_id: readRequiredNumber(raw, "pc_id"),
        arcana_id: readRequiredNumber(raw, "arcana_id"),
        description: readOptionalString(raw, "description"),
    }
}

export function validateCreatePcEquipmentInput(input: unknown): CreatePcEquipmentInput {
    const raw = ensureObject(input)

    return {
        pc_id: readRequiredNumber(raw, "pc_id"),
        main_hand: readOptionalNumber(raw, "main_hand"),
        off_hand: readOptionalNumber(raw, "off_hand"),
        armor: readOptionalNumber(raw, "armor"),
        accessory: readOptionalNumber(raw, "accessory"),
    }
}

export function validateCreatePcInventoryInput(input: unknown): CreatePcInventoryInput {
    const raw = ensureObject(input)

    return {
        pc_id: readRequiredNumber(raw, "pc_id"),
        item_id: readRequiredNumber(raw, "item_id"),
        quantity: readRequiredNumber(raw, "quantity"),
    }
}

export function validateCreatePcBondInput(input: unknown): PcBondInput {
    const raw = ensureObject(input)

    return {
        pc_id: readRequiredNumber(raw, "pc_id"),
        target_type: validateStringEnum(raw.target_type, "target_type", ALLOWED_BOND_TARGET_TYPE),
        target_id: readOptionalNumber(raw, "target_id"),
        target_name: readOptionalString(raw, "target_name"),
        admiration_axis: validateStringNullabeEnum(raw.admiration_axis, "admiration_axis", ALLOWED_BOND_ADMIRATION),
        loyalty_axis: validateStringNullabeEnum(raw.loyalty_axis, "loyalty_axis", ALLOWED_BOND_LOYALTY),
        affection_axis: validateStringNullabeEnum(raw.affection_axis, "affection_axis", ALLOWED_BOND_AFFECTION),
        description: readOptionalString(raw, "description"),
    }
}
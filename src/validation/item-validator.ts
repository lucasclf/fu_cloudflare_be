import {
    ALLOWED_ITEM_TYPES,
  ALLOWED_WEAPON_CATEGORIES,
  type CreateItemInput,
  type ItemType,
  type UpdateItemInput,
  type WeaponCategory,
} from "../domain/items/item";
import { ValidationError } from "../domain/domain-errors";

type RawItemInput = {
  name?: unknown;
  item_type?: unknown;
  description?: unknown;
  url_key?: unknown;
  cost?: unknown;

  weapon_category?: unknown;
  accuracy?: unknown;
  damage?: unknown;
  damage_type?: unknown;
  grip?: unknown;
  distance?: unknown;
  
  defense?: unknown;
  magic_defense?: unknown;
  initiative?: unknown;

  is_martial?: unknown;
};

const MAX_NAME_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 20_000;
const MAX_URL_LENGTH = 1_000;
const MAX_TEXT_FIELD_LENGTH = 255;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateStringEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[]
): T {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new ValidationError(`${fieldName} is required`);
  }

  if (!allowedValues.includes(normalized as T)) {
    throw new ValidationError(`${fieldName} is invalid`);
  }

  return normalized as T;
}

function normalizeRequiredString(
  value: unknown,
  fieldName: string,
  maxLength: number
): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new ValidationError(`${fieldName} is required`);
  }

  if (normalized.length > maxLength) {
    throw new ValidationError(`${fieldName} exceeds max length of ${maxLength}`);
  }

  return normalized;
}

function normalizeOptionalString(
  value: unknown,
  fieldName: string,
  maxLength: number
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new ValidationError(`${fieldName} exceeds max length of ${maxLength}`);
  }

  return normalized;
}

function normalizeOptionalInteger(value: unknown, fieldName: string): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (!Number.isInteger(value)) {
    throw new ValidationError(`${fieldName} must be an integer`);
  }

  if ((value as number) < 0) {
    throw new ValidationError(`${fieldName} must be zero or greater`);
  }

  return value as number;
}

function normalizeOptionalBoolean(value: unknown, fieldName: string): boolean | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "boolean") {
    throw new ValidationError(`${fieldName} must be a boolean`);
  }

  return value;
}

function validateItemType(value: unknown): ItemType {
  return validateStringEnum(value, "item_type", ALLOWED_ITEM_TYPES);
}

function normalizeWeaponCategory(
  itemType: ItemType,
  value: unknown
): WeaponCategory | null {
  if (itemType !== "arma") {
    if (value !== undefined && value !== null && value !== "") {
      throw new ValidationError(
        "weapon_category must be null for non-weapon items"
      );
    }

    return null;
  }

  return validateStringEnum(
    value,
    "weapon_category",
    ALLOWED_WEAPON_CATEGORIES
  );
}

function parseBaseItemInput(raw: unknown) {
  if (!isObject(raw)) {
    throw new ValidationError("Request body must be a JSON object");
  }

  const input: RawItemInput = raw;
  const itemType = validateItemType(input.item_type);

  return {
    name: normalizeRequiredString(input.name, "name", MAX_NAME_LENGTH),
    item_type: itemType,
    description: normalizeOptionalString(
      input.description,
      "description",
      MAX_DESCRIPTION_LENGTH
    ),
    url_key: normalizeOptionalString(input.url_key, "url_key", MAX_URL_LENGTH),
    cost: normalizeOptionalInteger(input.cost, "cost"),

    weapon_category: normalizeWeaponCategory(itemType, input.weapon_category),
    accuracy: normalizeOptionalString(
      input.accuracy,
      "accuracy",
      MAX_TEXT_FIELD_LENGTH
    ),
    damage: normalizeOptionalString(input.damage, "damage", MAX_TEXT_FIELD_LENGTH),
    damage_type: normalizeOptionalString(
      input.damage_type,
      "damage_type",
      MAX_TEXT_FIELD_LENGTH
    ),
    grip: normalizeOptionalString(input.grip, "grip", MAX_TEXT_FIELD_LENGTH),
    distance: normalizeOptionalString(input.distance, "distance", MAX_TEXT_FIELD_LENGTH),

    defense: normalizeOptionalString(input.defense, "defense", MAX_TEXT_FIELD_LENGTH),
    magic_defense: normalizeOptionalString(
      input.magic_defense,
      "magic_defense",
      MAX_TEXT_FIELD_LENGTH
    ),
    initiative: normalizeOptionalString(input.initiative, "initiative", MAX_TEXT_FIELD_LENGTH),

    is_martial: normalizeOptionalBoolean(input.is_martial, "is_martial"),
  };
}

function assertRequired<T>(
  value: T | null,
  fieldName: string
): asserts value is T {
  if (value === null) {
    throw new ValidationError(`${fieldName} is required`);
  }
}

function validateWeaponInput(base: ReturnType<typeof parseBaseItemInput>): CreateItemInput {
  assertRequired(base.cost, "cost");
  assertRequired(base.weapon_category, "weapon_category");
  assertRequired(base.accuracy, "accuracy");
  assertRequired(base.damage, "damage");
  assertRequired(base.is_martial, "is_martial");
  assertRequired(base.damage_type, "damage_type");
  assertRequired(base.grip, "grip");
  assertRequired(base.distance, "distance");

  return {
    ...base,
    defense: null,
    magic_defense: null,
    initiative: null,
  };
}

function validateArmorInput(base: ReturnType<typeof parseBaseItemInput>): CreateItemInput {
  assertRequired(base.cost, "cost");
  assertRequired(base.defense, "defense");
  assertRequired(base.magic_defense, "magic_defense");
  assertRequired(base.initiative, "initiative");
  assertRequired(base.is_martial, "is_martial");

  return {
    ...base,
    weapon_category: null,
    accuracy: null,
    damage: null,
    damage_type: null,
    grip: null,
    distance: null,
  };
}

function validateShieldInput(base: ReturnType<typeof parseBaseItemInput>): CreateItemInput {
  assertRequired(base.cost, "cost");
  assertRequired(base.defense, "defense");
  assertRequired(base.magic_defense, "magic_defense");
  assertRequired(base.initiative, "initiative");
  assertRequired(base.is_martial, "is_martial");

  return {
    ...base,
    weapon_category: null,
    accuracy: null,
    damage: null,
    damage_type: null,
    grip: null,
    distance: null,
  };
}

function validateAccessoryInput(base: ReturnType<typeof parseBaseItemInput>): CreateItemInput {
  assertRequired(base.cost, "cost");

  return {
    ...base,
    weapon_category: null,
    accuracy: null,
    damage: null,
    damage_type: null,
    grip: null,
    distance: null,
    defense: null,
    magic_defense: null,
    initiative: null,
    is_martial: null,
  };
}

function validateArtifactInput(base: ReturnType<typeof parseBaseItemInput>): CreateItemInput {
  return {
    ...base,
    cost: null,
    weapon_category: null,
    accuracy: null,
    damage: null,
    damage_type: null,
    grip: null,
    distance: null,
    defense: null,
    magic_defense: null,
    initiative: null,
    is_martial: null,
  };
}

function validateGenericItemInput(
  base: ReturnType<typeof parseBaseItemInput>
): CreateItemInput {
  return {
    ...base,
    cost: null,
    weapon_category: null,
    accuracy: null,
    damage: null,
    damage_type: null,
    grip: null,
    distance: null,
    defense: null,
    magic_defense: null,
    initiative: null,
    is_martial: null,
  };
}

export function validateCreateItemInput(raw: unknown): CreateItemInput {
  const base = parseBaseItemInput(raw);

  switch (base.item_type) {
    case "arma":
      return validateWeaponInput(base);
    case "armadura":
      return validateArmorInput(base);
    case "escudo":
      return validateShieldInput(base);
    case "acessorio":
      return validateAccessoryInput(base);
    case "artefato":
      return validateArtifactInput(base);
    case "outros":
      return validateGenericItemInput(base);
  }
}

export function validateUpdateItemInput(raw: unknown): UpdateItemInput {
  return validateCreateItemInput(raw);
}
import { ValidationError } from "../domain/domain-errors";
import {
	ALLOWED_ITEM_TYPES,
	ALLOWED_WEAPON_CATEGORIES,
	type CreateItemInput,
	type ItemType,
	type UpdateItemInput,
	type WeaponCategory,
} from "../domain/items/item";
import {
	assertRequired,
	ensureObject,
	readBooleanWithDefault,
	readOptionalNumber,
	readOptionalString,
	readRequiredString,
	validateStringEnum,
} from "./generic-validator";

const MAX_NAME_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 20_000;
const MAX_URL_LENGTH = 1_000;
const MAX_TEXT_FIELD_LENGTH = 255;

function validateItemType(value: unknown): ItemType {
	return validateStringEnum(value, "item_type", ALLOWED_ITEM_TYPES);
}

function validateWeaponCategory(
	itemType: ItemType,
	value: unknown,
): WeaponCategory | null {
	if (itemType !== "arma") {
		if (value !== undefined && value !== null && value !== "") {
			throw new ValidationError(
				"weapon_category must be null for non-weapon items",
			);
		}

		return null;
	}

	return validateStringEnum(
		value,
		"weapon_category",
		ALLOWED_WEAPON_CATEGORIES,
	);
}

function assertNonNegativeNumber(
	value: number | null,
	fieldName: string,
): void {
	if (value !== null && value < 0) {
		throw new ValidationError(`${fieldName} must be zero or greater`);
	}
}

function parseBaseItemInput(raw: unknown) {
	const input = ensureObject(raw);
	const itemType = validateItemType(input.item_type);

	const base = {
		name: readRequiredString(
			input,
			"name",
		),
		item_type: itemType,

		description: readOptionalString(
			input,
			"description",
		),
		img_key: readOptionalString(
			input,
			"img_key",
		),
		cost: readOptionalNumber(input, "cost"),

		weapon_category: validateWeaponCategory(
			itemType,
			input.weapon_category,
		),
		accuracy: readOptionalString(
			input,
			"accuracy",
		),
		damage: readOptionalString(
			input,
			"damage",
		),
		damage_type: readOptionalString(
			input,
			"damage_type",
		),
		grip: readOptionalString(
			input,
			"grip",
		),
		distance: readOptionalString(
			input,
			"distance",
		),

		defense_dice: readOptionalString(
			input,
			"defense_dice",
		),
		defense_bonus: readOptionalNumber(input, "defense_bonus"),

		magic_defense_dice: readOptionalString(
			input,
			"magic_defense_dice",
		),
		magic_defense_bonus: readOptionalNumber(
			input,
			"magic_defense_bonus",
		),

		initiative: readOptionalString(
			input,
			"initiative",
		),

		is_martial: readBooleanWithDefault(input, "is_martial", false),
	};

	assertNonNegativeNumber(base.cost, "cost");

	return base;
}

function assertHasDefenseValue(
	defenseDice: string | null,
	defenseBonus: number | null,
	itemLabel: string,
): void {
	if (defenseDice === null && defenseBonus === null) {
		throw new ValidationError(
			`${itemLabel} must have defense_dice or defense_bonus`,
		);
	}
}

function assertHasMagicDefenseValue(
	magicDefenseDice: string | null,
	magicDefenseBonus: number | null,
	itemLabel: string,
): void {
	if (magicDefenseDice === null && magicDefenseBonus === null) {
		throw new ValidationError(
			`${itemLabel} must have magic_defense_dice or magic_defense_bonus`,
		);
	}
}

function validateWeaponInput(
	base: ReturnType<typeof parseBaseItemInput>,
): CreateItemInput {
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
		defense_dice: null,
		magic_defense_dice: null,

		initiative: null,
	};
}

function validateArmorInput(
	base: ReturnType<typeof parseBaseItemInput>,
): CreateItemInput {
	assertRequired(base.cost, "cost");
	assertRequired(base.initiative, "initiative");
	assertRequired(base.is_martial, "is_martial");

	assertHasDefenseValue(
		base.defense_dice,
		base.defense_bonus,
		"armor",
	);

	assertHasMagicDefenseValue(
		base.magic_defense_dice,
		base.magic_defense_bonus,
		"armor",
	);

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

function validateShieldInput(
	base: ReturnType<typeof parseBaseItemInput>,
): CreateItemInput {
	assertRequired(base.cost, "cost");
	assertRequired(base.initiative, "initiative");
	assertRequired(base.is_martial, "is_martial");

	assertHasDefenseValue(
		base.defense_dice,
		base.defense_bonus,
		"shield",
	);

	assertHasMagicDefenseValue(
		base.magic_defense_dice,
		base.magic_defense_bonus,
		"shield",
	);

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

function validateAccessoryInput(
	base: ReturnType<typeof parseBaseItemInput>,
): CreateItemInput {
	assertRequired(base.cost, "cost");

	return {
		...base,
		weapon_category: null,
		accuracy: null,
		damage: null,
		damage_type: null,
		grip: null,
		distance: null,

		defense_dice: null,
		magic_defense_dice: null,

		initiative: null,
		is_martial: null,
	};
}

function validateArtifactInput(
	base: ReturnType<typeof parseBaseItemInput>,
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

		defense_dice: null,
		defense_bonus: null,
		magic_defense_dice: null,
		magic_defense_bonus: null,

		initiative: null,
		is_martial: null,
	};
}

function validateGenericItemInput(
	base: ReturnType<typeof parseBaseItemInput>,
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

		defense_dice: null,
		defense_bonus: null,
		magic_defense_dice: null,
		magic_defense_bonus: null,

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
		default:
			throw new ValidationError("item_type is invalid");
	}

}

export function validateUpdateItemInput(raw: unknown): UpdateItemInput {
	return validateCreateItemInput(raw);
}
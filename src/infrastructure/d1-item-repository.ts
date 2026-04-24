import type { CreateItemInput, Item } from "../domain/items/item";
import { ItemAlreadyExistsError } from "../domain/items/item-errors";

export class D1ItemRepository {
	constructor(private readonly db: D1Database) {}

	async findAll(): Promise<Item[]> {
		const { results } = await this.db
			.prepare(`
            SELECT
              id,
              name,
              item_type,
              description,
              img_key,
              cost,
              weapon_category,
              accuracy,
              damage,
              damage_type,
              grip,
              distance,
              defense,
              magic_defense,
              initiative,
              is_martial,
              created_at,
              updated_at
            FROM items
            ORDER BY
              item_type ASC,
              weapon_category ASC,
              name ASC
          `)
			.all<Item>();

		return results;
	}

	async findByItemName(name: string): Promise<Item | null> {
		const result = await this.db
			.prepare(`
             SELECT
              id,
              name,
              item_type,
              description,
              img_key,
              cost,
              weapon_category,
              accuracy,
              damage,
              damage_type,
              grip,
              distance,
              defense,
              magic_defense,
              initiative,
              is_martial,
              created_at,
              updated_at
            FROM items
            WHERE name = ?
            LIMIT 1
          `)
			.bind(name)
			.first<Item>();

		return result ?? null;
	}

	async findByItemType(itemType: string): Promise<Item[]> {
		const { results } = await this.db
			.prepare(`
             SELECT
              id,
              name,
              item_type,
              description,
              img_key,
              cost,
              weapon_category,
              accuracy,
              damage,
              damage_type,
              grip,
              distance,
              defense,
              magic_defense,
              initiative,
              is_martial,
              created_at,
              updated_at
            FROM items
            WHERE item_type = ?
          `)
			.bind(itemType)
			.all<Item>();

		return results;
	}

	async findByWeaponCategory(weaponCategory: string): Promise<Item[]> {
		const { results } = await this.db
			.prepare(`
             SELECT
              id,
              name,
              item_type,
              description,
              img_key,
              cost,
              weapon_category,
              accuracy,
              damage,
              damage_type,
              grip,
              distance,
              defense,
              magic_defense,
              initiative,
              is_martial,
              created_at,
              updated_at
            FROM items
            WHERE weapon_category = ?
          `)
			.bind(weaponCategory)
			.all<Item>();

		return results;
	}

	async create(input: CreateItemInput): Promise<void> {
		try {
			await this.db
				.prepare(`
            INSERT INTO items (
                name,
                item_type,
                description,
                img_key,
                cost,
                weapon_category,
                accuracy,
                damage,
                damage_type,
                grip,
                distance,
                defense,
                magic_defense,
                initiative,
                is_martial
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
				.bind(
					input.name,
					input.item_type,
					input.description,
					input.img_key,
					input.cost,
					input.weapon_category,
					input.accuracy,
					input.damage,
					input.damage_type,
					input.grip,
					input.distance,
					input.defense,
					input.magic_defense,
					input.initiative,
					input.is_martial,
				)
				.run();
		} catch (error) {
			const message = error instanceof Error ? error.message : "";

			if (message.includes("UNIQUE constraint failed")) {
				throw new ItemAlreadyExistsError(input.name);
			}

			throw error;
		}
	}
}

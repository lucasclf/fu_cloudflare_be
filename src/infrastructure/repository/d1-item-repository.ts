import type { CreateItemInput, Item } from "../../domain/items/item";
import { ItemAlreadyExistsError } from "../../domain/items/item-errors";
import { buildInPlaceholders, D1Boolean, fromBoolean, mapById, toNullableBoolean, uniqueNumbers } from "../d1-utils";
import { ItemEntity } from "../entity/item";

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
              defense_dice,
              defense_bonus,
              magic_defense_dice,
              magic_defense_bonus,
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
			.all<ItemEntity>();

		return results.map((row) => this.toItem(row));
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
              defense_dice,
              defense_bonus,
              magic_defense_dice,
              magic_defense_bonus,
              initiative,
              is_martial,
              created_at,
              updated_at
            FROM items
            WHERE name = ?
            LIMIT 1
          `)
			.bind(name)
			.first<ItemEntity>();

		return result ? this.toItem(result) : null;
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
              defense_dice,
              defense_bonus,
              magic_defense_dice,
              magic_defense_bonus,
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
              defense_dice,
              defense_bonus,
              magic_defense_dice,
              magic_defense_bonus,
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
                defense_dice,
                defense_bonus,
                magic_defense_dice,
                magic_defense_bonus,
                initiative,
                is_martial
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
				.bind(
					input.name,
          input.item_type,
          input.description ?? null,
          input.img_key ?? null,
          input.cost ?? null,

          input.weapon_category ?? null,
          input.accuracy ?? null,
          input.damage ?? null,
          input.damage_type ?? null,
          input.grip ?? null,
          input.distance ?? null,

          input.defense_dice ?? null,
          input.defense_bonus ?? null,
          input.magic_defense_dice ?? null,
          input.magic_defense_bonus ?? null,

          input.initiative ?? null,
          input.is_martial === null || input.is_martial === undefined
            ? null
            : fromBoolean(input.is_martial),
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

  async findByIds(itemIds: number[]): Promise<Map<number, Item>> {
    if (itemIds.length === 0) {
      return new Map();
    }

    const uniqueItemIds = uniqueNumbers(itemIds);
    const placeholders = buildInPlaceholders(uniqueItemIds);

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
          defense_dice,
          defense_bonus,
          magic_defense_dice,
          magic_defense_bonus,
          initiative,
          is_martial,
          created_at,
          updated_at
        FROM items
        WHERE id IN (${placeholders})
      `)
      .bind(...uniqueItemIds)
      .all<ItemEntity>();

    const items = results.map((row) => this.toItem(row));

    return mapById(items);
  }

  private toItem(row: ItemEntity): Item {
    return {
      ...row,
      item_type: row.item_type as Item["item_type"],
      weapon_category: row.weapon_category as Item["weapon_category"],
      is_martial: toNullableBoolean(row.is_martial),
    };
  }
}

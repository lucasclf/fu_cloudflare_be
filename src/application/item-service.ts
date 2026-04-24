import type { CreateItemInput, Item } from "../domain/items/item";
import type { D1ItemRepository } from "../infrastructure/d1-item-repository";

export class ItemService {
	constructor(private readonly repository: D1ItemRepository) {}

	async listItems(): Promise<Item[]> {
		return this.repository.findAll();
	}

	async getItemByName(itemName: string): Promise<Item | null> {
		return this.repository.findByItemName(itemName);
	}

	async createItem(input: CreateItemInput): Promise<void> {
		await this.repository.create(input);
	}

	/* async updateItem(itemNumber: number, input: UpdateItemInput): Promise<void> {
    await this.repository.updateByItemNumber(itemNumber, input);
  }

  async deleteItem(itemNumber: number): Promise<void> {
    await this.repository.deleteByItemNumber(itemNumber);
  } */
}

import type { CreateItemInput, Item, UpdateItemInput } from "../domain/items/item";
import type { D1ItemRepository } from "../infrastructure/repository/d1-item-repository";
import { ItemRepositoryPort } from "./ports/item-ports";

export class ItemService {
	constructor(		
		private readonly itemRepository: ItemRepositoryPort,
	) {}

	async listItems(globalOnly?: boolean): Promise<Item[]> {
		return await this.itemRepository.findAll(globalOnly);
	}

	async getItemByName(itemName: string): Promise<Item | null> {
		return await this.itemRepository.findByItemName(itemName);
	}

	async createItem(input: CreateItemInput): Promise<number> {
		return await this.itemRepository.create(input);
	}

	async updateItem(id: number, input: UpdateItemInput): Promise<void> {
		await this.itemRepository.update(id, input);
	}
}

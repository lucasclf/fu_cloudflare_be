import type {
	CreateItemInput,
	Item,
} from "../../domain/items/item";

export interface ItemReaderPort {
	findAll(globalOnly?: boolean): Promise<Item[]>;
	findByItemName(itemName: string): Promise<Item | null>;
}

export interface ItemWriterPort {
	create(input: CreateItemInput): Promise<number>;
}

export interface ItemRepositoryPort
	extends ItemReaderPort,
		ItemWriterPort {}
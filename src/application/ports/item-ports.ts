import type {
	CreateItemInput,
	Item,
} from "../../domain/items/item";

export interface ItemReaderPort {
	findAll(): Promise<Item[]>;
	findByItemName(itemName: string): Promise<Item | null>;
}

export interface ItemWriterPort {
	create(input: CreateItemInput): Promise<void>;
}

export interface ItemRepositoryPort
	extends ItemReaderPort,
		ItemWriterPort {}
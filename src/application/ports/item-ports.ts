import type {
	CreateItemInput,
	Item,
	UpdateItemInput,
} from "../../domain/items/item";

export interface ItemReaderPort {
	findAll(globalOnly?: boolean): Promise<Item[]>;
	findByItemName(itemName: string): Promise<Item | null>;
}

export interface ItemWriterPort {
	create(input: CreateItemInput): Promise<number>;
	update(id: number, input: UpdateItemInput): Promise<void>;
}

export interface ItemRepositoryPort
	extends ItemReaderPort,
		ItemWriterPort {}
import { D1Boolean } from "../d1-utils";

export type ItemEntity = {
	id: number;
	name: string;
	item_type: string;
	description: string | null;
	img_key: string | null;
	cost: number | null;

	weapon_category: string | null;
	accuracy: string | null;
	damage: string | null;
	damage_type: string | null;
	grip: string | null;
	distance: string | null;

	defense_dice: string | null;
	defense_bonus: number | null;
	magic_defense_dice: string | null;
	magic_defense_bonus: number | null;

	initiative: string | null;
	is_martial: D1Boolean;

	created_at: string;
	updated_at: string | null;
};
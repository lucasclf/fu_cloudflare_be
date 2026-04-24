export const ALLOWED_ITEM_TYPES = [
  "arma",
  "armadura",
  "escudo",
  "acessorio",
  "artefato",
  "outros",
] as const;

export type ItemType = (typeof ALLOWED_ITEM_TYPES)[number];

export const ALLOWED_WEAPON_CATEGORIES = [
  "arcana",
  "arco",
  "luta",
  "adaga",
  "arma_de_fogo",
  "malho",
  "pesado",
  "lança",
  "espada",
  "arremesso",
] as const;

export type WeaponCategory = (typeof ALLOWED_WEAPON_CATEGORIES)[number];

export interface Item {
  id: number;
  name: string;
  item_type: ItemType;
  description: string | null;
  img_key: string | null;
  cost: number | null;

  weapon_category: WeaponCategory | null;
  accuracy: string | null;
  damage: string | null;
  damage_type: string | null;
  grip: string | null;
  distance: string | null;

  defense: number | null;
  magic_defense: number | null;
  initiative: number | null;

  is_martial: boolean | null;

  created_at: string;
  updated_at: string | null;
}

export interface CreateItemInput {
  name: string;
  item_type: ItemType;
  description: string | null;
  img_key: string | null;
  cost: number | null;

  weapon_category: WeaponCategory | null;
  accuracy: string | null;
  damage: string | null;
  damage_type: string | null;
  grip: string | null;
  distance: string | null;

  defense: string | null;
  magic_defense: string | null;
  initiative: string | null;

  is_martial: boolean | null;
}

export interface UpdateItemInput {
  name: string;
  item_type: ItemType;
  description: string | null;
  img_key: string | null;
  cost: number | null;

  weapon_category: WeaponCategory | null;
  accuracy: string | null;
  damage: string | null;
  damage_type: string | null;
  grip: string | null;
  distance: string | null;
  
  defense: string | null;
  magic_defense: string | null;
  initiative: string | null;

  is_martial: boolean | null;
}
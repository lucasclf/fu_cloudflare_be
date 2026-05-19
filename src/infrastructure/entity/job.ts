import { D1Boolean } from "../d1-utils";

export type JobPowerEntity = {
    id: number;
    name: string;
    description: string;
    type: string;
    max_level: number;
    is_global: D1Boolean;
    created_at?: string;
    updated_at?: string | null;
};

export type JobPowerWithJobEntity = JobPowerEntity & {
    job_name: string | null;
};

export type JobEntity = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  img_key: string | null;

  hp_bonus: number;
  mp_bonus: number;
  ip_bonus: number;

  allows_martial_armor: D1Boolean;
  allows_martial_shield: D1Boolean;
  allows_martial_ranged_weapon: D1Boolean;
  allows_martial_melee_weapon: D1Boolean;
  allows_arcane: D1Boolean;
  allows_rituals: D1Boolean;
  allows_monster_spells: D1Boolean;
  can_start_projects: D1Boolean;

  created_at: string;
  updated_at: string | null;
};

export type ResumeJobEntity = Omit<
  JobEntity,
  "description" | "created_at" | "updated_at"
>;

export type JobSpellEntity = {
    id: number;
    job_id: number;
    name: string;
    description: string;
    is_offensive: D1Boolean;
    cost: string;
    target: string;
    duration: string;
    created_at?: string;
    updated_at?: string | null;
};

export type JobSpellWithJobEntity = JobSpellEntity & {
    job_name: string;
};

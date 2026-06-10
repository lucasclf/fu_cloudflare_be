// Script de uso único: mescla e normaliza os dados de itens do fabula_helper
// (fabula_helper/jsons/*.json) em fudb/seed/data/items.json, no formato
// aceito pelo gerador de seeds (scripts/generate-seed.mjs).
//
// Uso: node scripts/build-items-seed-data.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(__dirname, "..", "..", "fabula_helper", "jsons");
const outputPath = join(__dirname, "..", "seed", "data", "items.json");

const DAMAGE_TYPE_MAP = {
    fisico: "physical",
    luz: "light",
    trevas: "dark",
    ar: "air",
    veneno: "poison",
    raio: "bolt",
    fogo: "fire",
    terra: "earth",
    gelo: "ice",
};

const GRIP_MAP = {
    duas_maos: "duas_maos",
    duas_mao: "duas_maos", // corrige erro de digitação na fonte original
    uma_mao: "uma_mao",
};

const DISTANCE_MAP = {
    corpo_a_corpo: "corpo_a_corpo",
    distancia: "a_distancia",
};

function readSource(file) {
    return JSON.parse(readFileSync(join(sourceDir, file), "utf-8"));
}

const ITEM_DEFAULTS = {
    description: null,
    img_key: null,
    cost: null,
    weapon_category: null,
    accuracy: null,
    damage: null,
    damage_type: null,
    grip: null,
    distance: null,
    defense_dice: null,
    defense_bonus: null,
    magic_defense_dice: null,
    magic_defense_bonus: null,
    initiative: null,
    is_martial: null,
};

function buildWeapons() {
    return readSource("weapons_request.json").map((w) => ({
        ...ITEM_DEFAULTS,
        name: w.name,
        item_type: w.item_type,
        img_key: w.img_key,
        cost: w.cost,
        weapon_category: w.weapon_category,
        accuracy: w.accuracy,
        damage: w.damage,
        damage_type: DAMAGE_TYPE_MAP[w.damage_type],
        grip: GRIP_MAP[w.grip],
        distance: DISTANCE_MAP[w.distance],
        is_martial: w.is_martial,
    }));
}

function buildArmors() {
    return readSource("armor_request.json").map((a) => ({
        ...ITEM_DEFAULTS,
        name: a.name,
        item_type: a.item_type,
        img_key: a.img_key,
        cost: a.cost,
        defense_dice: a.defense_dice,
        defense_bonus: a.defense_bonus,
        magic_defense_dice: a.magic_defense_dice,
        magic_defense_bonus: a.magic_defense_bonus,
        initiative: a.initiative,
        is_martial: a.is_martial,
    }));
}

function buildShields() {
    return readSource("shield_request.json").map((s) => ({
        ...ITEM_DEFAULTS,
        name: s.name,
        item_type: s.item_type,
        img_key: s.img_key,
        cost: s.cost,
        defense_bonus: s.defense_bonus,
        magic_defense_bonus: s.magic_defense_bonus,
        initiative: s.initiative,
        is_martial: s.is_martial,
    }));
}

function buildAccessories() {
    return readSource("accessory_request.json").map((a) => ({
        ...ITEM_DEFAULTS,
        name: a.name,
        item_type: a.item_type,
        img_key: a.img_key,
        cost: a.cost,
        description: a.description,
    }));
}

function buildArtifacts() {
    return readSource("artifact_request.json").map((a) => ({
        ...ITEM_DEFAULTS,
        name: a.name,
        item_type: a.item_type,
        img_key: a.img_key,
        description: a.description,
    }));
}

const items = [
    ...buildWeapons(),
    ...buildArmors(),
    ...buildShields(),
    ...buildAccessories(),
    ...buildArtifacts(),
];

writeFileSync(outputPath, JSON.stringify(items, null, 2) + "\n", "utf-8");
console.log(`Gerado ${outputPath} com ${items.length} itens.`);

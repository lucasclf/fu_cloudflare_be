import { describe, expect, it } from "vitest";
import { PcBondResolver } from "../../../src/application/pc-bond-resolver";
import type {
	BondTargetSummary,
	PcBond,
} from "../../../src/domain/pc/pc";
import type { PcBondTargetReaderPort } from "../../../src/application/ports/pc-ports";

function makeRepository(
	targets: BondTargetSummary[],
): PcBondTargetReaderPort {
	return {
		async findBondTargetsByIds(ids: number[]) {
			const map = new Map<number, BondTargetSummary>();

			for (const target of targets) {
				if (ids.includes(target.id)) {
					map.set(target.id, target);
				}
			}

			return map;
		},
	};
}

function makeBond(overrides: Partial<PcBond> = {}): PcBond {
	return {
		id: 1,
		pc_id: 1,
		target_type: "freeform",
		target_id: null,
		target_name: "Alvo Livre",
		img_key: null,
		admiration_axis: "admiration",
		loyalty_axis: null,
		affection_axis: null,
		description: null,

		...overrides,
	};
}

describe("PcBondResolver", () => {
	it("resolve bond freeform usando target_name e img_key normalizado", async () => {
		const resolver = new PcBondResolver(
			makeRepository([]),
			makeRepository([]),
			makeRepository([]),
		);

		const [bond] = await resolver.resolve([
			makeBond({
				target_type: "freeform",
				target_id: null,
				target_name: "O Cavaleiro Sem Rosto",
			}),
		]);

		expect(bond.target_name).toBe("O Cavaleiro Sem Rosto");
		expect(bond.img_key).toBe("o_cavaleiro_sem_rosto");
	});

	it("resolve bond com pc usando repository de pcs", async () => {
		const resolver = new PcBondResolver(
			makeRepository([
				{
					id: 2,
					name: "Outro PC",
					img_key: "outro_pc",
				},
			]),
			makeRepository([]),
			makeRepository([]),
		);

		const [bond] = await resolver.resolve([
			makeBond({
				target_type: "pc",
				target_id: 2,
				target_name: null,
			}),
		]);

		expect(bond.target_name).toBe("Outro PC");
		expect(bond.img_key).toBe("outro_pc");
	});

	it("resolve bond com npc usando repository de npcs", async () => {
		const resolver = new PcBondResolver(
			makeRepository([]),
			makeRepository([
				{
					id: 3,
					name: "Cid",
					img_key: "cid",
				},
			]),
			makeRepository([]),
		);

		const [bond] = await resolver.resolve([
			makeBond({
				target_type: "npc",
				target_id: 3,
				target_name: null,
			}),
		]);

		expect(bond.target_name).toBe("Cid");
		expect(bond.img_key).toBe("cid");
	});

	it("resolve bond com monster usando repository de monstros", async () => {
		const resolver = new PcBondResolver(
			makeRepository([]),
			makeRepository([]),
			makeRepository([
				{
					id: 4,
					name: "Gárgula",
					img_key: "gargula",
				},
			]),
		);

		const [bond] = await resolver.resolve([
			makeBond({
				target_type: "monster",
				target_id: 4,
				target_name: null,
			}),
		]);

		expect(bond.target_name).toBe("Gárgula");
		expect(bond.img_key).toBe("gargula");
	});

	it("lança erro quando bond freeform não tem target_name", async () => {
		const resolver = new PcBondResolver(
			makeRepository([]),
			makeRepository([]),
			makeRepository([]),
		);

		await expect(
			resolver.resolve([
				makeBond({
					target_type: "freeform",
					target_id: null,
					target_name: null,
				}),
			]),
		).rejects.toThrow(
			"target_name is required when target_type is freeform",
		);
	});

	it("lança erro quando target_id está ausente para target_type referenciado", async () => {
		const resolver = new PcBondResolver(
			makeRepository([]),
			makeRepository([]),
			makeRepository([]),
		);

		await expect(
			resolver.resolve([
				makeBond({
					target_type: "npc",
					target_id: null,
					target_name: null,
				}),
			]),
		).rejects.toThrow(
			"target_id is required when target_type is npc",
		);
	});

	it("lança erro quando alvo referenciado não é encontrado", async () => {
		const resolver = new PcBondResolver(
			makeRepository([]),
			makeRepository([]),
			makeRepository([]),
		);

		await expect(
			resolver.resolve([
				makeBond({
					target_type: "monster",
					target_id: 999,
					target_name: null,
				}),
			]),
		).rejects.toThrow("Monster target not found: 999");
	});
});
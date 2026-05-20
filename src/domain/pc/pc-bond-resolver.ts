import { ValidationError } from "../domain-errors";
import type {
	BondTargetSummary,
	PcBond,
	TargetType,
} from "./pc";

type BondTargetRepository = {
	findBondTargetsByIds(ids: number[]): Promise<Map<number, BondTargetSummary>>;
};

export class PcBondResolver {
	constructor(
		private readonly pcRepository: BondTargetRepository,
		private readonly npcRepository: BondTargetRepository,
		private readonly monsterRepository: BondTargetRepository,
	) {}

	async resolve(bonds: PcBond[]): Promise<PcBond[]> {
		if (bonds.length === 0) {
			return [];
		}

		const pcTargetIds = this.collectTargetIds(bonds, "pc");
		const npcTargetIds = this.collectTargetIds(bonds, "npc");
		const monsterTargetIds = this.collectTargetIds(bonds, "monster");

		const [pcsById, npcsById, monstersById] = await Promise.all([
			this.pcRepository.findBondTargetsByIds(pcTargetIds),
			this.npcRepository.findBondTargetsByIds(npcTargetIds),
			this.monsterRepository.findBondTargetsByIds(monsterTargetIds),
		]);

		return bonds.map((bond) => {
			if (bond.target_type === "freeform") {
				return this.resolveFreeformBond(bond);
			}

			if (bond.target_id === null) {
				throw new ValidationError(
					`target_id is required when target_type is ${bond.target_type}`,
				);
			}

			const target = this.findTarget(
				bond.target_type,
				bond.target_id,
				pcsById,
				npcsById,
				monstersById,
			);

			return {
				...bond,
				target_name: target.name,
				img_key: target.img_key,
			};
		});
	}

	private collectTargetIds(
		bonds: PcBond[],
		targetType: TargetType,
	): number[] {
		return bonds
			.filter(
				(bond) =>
					bond.target_type === targetType &&
					bond.target_id !== null,
			)
			.map((bond) => bond.target_id as number);
	}

	private resolveFreeformBond(bond: PcBond): PcBond {
		if (!bond.target_name) {
			throw new ValidationError(
				"target_name is required when target_type is freeform",
			);
		}

		return {
			...bond,
			target_name: bond.target_name,
			img_key: this.normalizeImgKey(bond.target_name),
		};
	}

	private findTarget(
		targetType: TargetType,
		targetId: number,
		pcsById: Map<number, BondTargetSummary>,
		npcsById: Map<number, BondTargetSummary>,
		monstersById: Map<number, BondTargetSummary>,
	): BondTargetSummary {
		switch (targetType) {
			case "pc": {
				const target = pcsById.get(targetId);

				if (!target) {
					throw new ValidationError(`PC target not found: ${targetId}`);
				}

				return target;
			}

			case "npc": {
				const target = npcsById.get(targetId);

				if (!target) {
					throw new ValidationError(`NPC target not found: ${targetId}`);
				}

				return target;
			}

			case "monster": {
				const target = monstersById.get(targetId);

				if (!target) {
					throw new ValidationError(
						`Monster target not found: ${targetId}`,
					);
				}

				return target;
			}

			case "freeform":
				throw new ValidationError(
					"freeform target must be resolved separately",
				);
		}
	}

	private normalizeImgKey(value: string): string {
		return value
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, "_")
			.replace(/^_+|_+$/g, "");
	}
}
import type { PcBase, PcFull, PcSummary } from "../domain/pc/pc";
import { PcFullAssembler } from "./pc-full-assembler";
import { PcReaderPort } from "./ports/pc-ports";


export class PcQueryService {
	constructor(
		private readonly pcRepository: PcReaderPort,
		private readonly pcFullAssembler: PcFullAssembler,
	) {}

	async findAllSummary(): Promise<PcSummary[]> {
		return await this.pcRepository.findAllSummary();
	}

	async findById(pcId: string): Promise<PcFull | null> {
		const pcBase = await this.pcRepository.findById(pcId);

		if (pcBase === null) {
			return null;
		}

		return await this.pcFullAssembler.assemble(pcBase);
	}
}
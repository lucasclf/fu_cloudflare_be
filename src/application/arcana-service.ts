import { Arcana, CreateArcanaInput } from "../domain/jobs/job";
import { D1ArcanaRepository } from "../infrastructure/d1-arcana-repository";

export class ArcanaService {
    constructor(
        private readonly arcanaRepository: D1ArcanaRepository,
    ) {}   

    async createArcana(input: CreateArcanaInput): Promise<void> {
        await this.arcanaRepository.create(input);
    }

    async listAll(): Promise<Arcana[]> {
        return await this.arcanaRepository.findAll();
    }

}
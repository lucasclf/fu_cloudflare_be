import { Arcana, CreateArcanaInput } from "../domain/jobs/job";
import { D1ArcanaRepository } from "../infrastructure/repository/d1-arcana-repository";

export class ArcanaService {
    constructor(
        private readonly arcanaRepository: D1ArcanaRepository,
    ) {}   

    async createArcana(input: CreateArcanaInput): Promise<void> {
        await this.arcanaRepository.create(input);
    }

    async listAll(globalOnly?: boolean): Promise<Arcana[]> {
        return await this.arcanaRepository.findAll(globalOnly);
    }

}
import { CreateLocationInput, Location } from "../domain/locations/location";
import { D1LocationRepository } from "../infrastructure/d1-location-repository";

export class LocationService {
    constructor(
        private readonly locationRepository: D1LocationRepository,
    ) {}   

    async createLocation(input: CreateLocationInput): Promise<void> {
        await this.locationRepository.create(input);
    }

    async listLocations(): Promise<Location[]> {
        return await this.locationRepository.listLocations();
    }

    async getLocationById(id: number): Promise<Location | null> {
        return await this.locationRepository.getLocationById(id);
    }
}
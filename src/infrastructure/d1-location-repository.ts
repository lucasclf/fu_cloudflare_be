import { CreateLocationInput, Location } from "../domain/locations/location";
import { LocationAlreadyExistsError } from "../domain/locations/location-errors";

export class D1LocationRepository {
    constructor(private readonly db: D1Database) {}

    async create(input: CreateLocationInput): Promise<void> {
            try {
                await this.db
                    .prepare(`
              INSERT INTO locations (
                name,
                description,
                tagline,
                img_key,
                location_type
              )
              VALUES (?, ?, ?, ?, ?)
            `)
                    .bind(
                        input.name,
                        input.description,
                        input.tagline,
                        input.img_key,
                        input.location_type,
                    )
                    .run();
            } catch (error) {
                const message = error instanceof Error ? error.message : "";
    
                if (message.includes("UNIQUE constraint failed")) {
                    throw new LocationAlreadyExistsError(input.name);
                }
    
                throw error;
            }
        }

    async listLocations(): Promise<Location[]> {
        const { results } = await this.db
            .prepare(`
                SELECT
                    id,   
                    name,   
                    description,
                    tagline,
                    img_key,
                    location_type,
                    created_at,
                    updated_at
                FROM locations
                ORDER BY name ASC
                `)
            .all<Location>();

        return results;
    }

    async getLocationById(id: number): Promise<Location | null> {
    const result = await this.db
                .prepare(`
            SELECT
              id,
              name,
              description,
              tagline,
              img_key,
              location_type,
              created_at,
              updated_at
            FROM locations
            WHERE id = ?
            LIMIT 1
          `)
                .bind(id)
                .first<Location>();
    
            return result ?? null;
    }
}
import { CreateLocationInput, Location } from "../../domain/locations/location";
import { LocationAlreadyExistsError } from "../../domain/locations/location-errors";
import { LocationEntity } from "../entity/faction-location";

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

    async findAll(): Promise<Location[]> {
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
            .all<LocationEntity>();

	    return results.map((row) => this.toLocation(row));
    }

    async findById(id: number): Promise<Location | null> {
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
                .first<LocationEntity>();
    
            return  result ? this.toLocation(result) : null;
    }

    private toLocation(row: LocationEntity): Location {
	return {
		...row,
		location_type: row.location_type as Location["location_type"],
	};
}
}
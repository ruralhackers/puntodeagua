import type { WaterPointRepository } from "features";
import { HttpClient, Id } from "core";
import { WaterPoint } from "features/entities/water-point";

export class WaterPointApiRestRepository implements WaterPointRepository {
	private readonly httpClient: HttpClient;

	constructor(baseUrl: string = "http://localhost:3000") {
		this.httpClient = new HttpClient(baseUrl);
	}

	async findAll(): Promise<WaterPoint[]> {
		const json = await this.httpClient.get<any[]>("water-points");
		return json.map(WaterPoint.create);
	}

	async findById(id: Id): Promise<WaterPoint | null> {
		try {
			const json = await this.httpClient.get<any>(`water-points/${id.value}`);
			return WaterPoint.create(json);
		} catch (error) {
			return null;
		}
	}

	async save(waterPoint: WaterPoint): Promise<WaterPoint> {
		const json = await this.httpClient.post<any>("water-points", waterPoint);
		return WaterPoint.create(json);
	}

	async delete(id: Id): Promise<void> {
		await this.httpClient.delete(`water-points/${id.value}`);
	}
}

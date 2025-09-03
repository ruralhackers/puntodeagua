import type { HttpClient, Id } from "core";
import type { WaterPointRepository } from "features";
import { WaterPoint } from "features/entities/water-point";
import type {WaterPointSchema} from "features/schemas/water-point.schema";
import {WaterPointDto} from "features/entities/water-point.dto";

export class WaterPointApiRestRepository implements WaterPointRepository {
	constructor(private readonly httpClient: HttpClient) {}

	async findAll(): Promise<WaterPoint[]> {
		const waterPointDtos = await this.httpClient.get<WaterPointDto[]>("water-points");
		return waterPointDtos.data.map(WaterPoint.create);
	}

	async findById(id: Id): Promise<WaterPoint | null> {
		try {
			const json = await this.httpClient.get<any>(`water-points/${id.toString()}`);
			return WaterPoint.create(json);
		} catch (error) {
			return null;
		}
	}

	async save(waterPoint: WaterPoint): Promise<void> {
		await this.httpClient.post<WaterPointSchema>("water-points", waterPoint);
		return
	}

	async delete(id: Id): Promise<void> {
		await this.httpClient.delete(`water-points/${id.toString()}`);
	}
}

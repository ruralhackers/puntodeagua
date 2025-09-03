import type { Id, Savable } from "core";
import type { WaterPoint } from "../entities/water-point";

export interface WaterPointRepository extends Savable<WaterPoint> {
	findById(id: Id): Promise<WaterPoint | null>;
	findAll(): Promise<WaterPoint[]>;
	delete(id: Id): Promise<void>;
}

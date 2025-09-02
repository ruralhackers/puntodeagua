import type { Id } from "core";
import type { WaterPoint } from "../entities/water-point";

export interface WaterPointRepository {
  save(waterPoint: WaterPoint): Promise<void>
  findById(id: Id): Promise<WaterPoint | null>
  findAll(): Promise<WaterPoint[]>
  delete(id: Id): Promise<void>
}

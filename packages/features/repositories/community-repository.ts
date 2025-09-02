import type { Id } from "core";
import type { Community } from "../entities/community";
import type { WaterPoint } from "../entities/water-point";

export interface CommunityRepository {
  save(community: Community): Promise<void>
  findById(id: Id): Promise<WaterPoint | null>
  findAll(): Promise<WaterPoint[]>
  delete(id: Id): Promise<void>
}

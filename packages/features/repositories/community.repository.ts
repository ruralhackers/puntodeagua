import type { Deletable, FindableAll, FindableById, Savable } from "core";
import type { Community } from "../entities/community";

export interface CommunityRepository extends Savable<Community>, Deletable<Community>, FindableById<Community>, FindableAll<Community> {
}

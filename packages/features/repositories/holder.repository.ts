import type { Deletable, FindableAll, FindableById, Savable } from "core";
import type { Holder } from "../entities/holder";

export interface PlanRepository extends Savable<Holder>, Deletable<Holder>, FindableById<Holder>, FindableAll<Holder> {
}
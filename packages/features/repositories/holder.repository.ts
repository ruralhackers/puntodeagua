import type { Id } from "core";
import type { Holder } from "../entities/holder";

export interface HolderRepository {
  findById(id: Id): Promise<Holder | null>
  findAll(): Promise<Holder[]>
  delete(id: Id): Promise<void>
}

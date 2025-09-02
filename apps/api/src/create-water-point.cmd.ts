import {Command} from "core";
import {WaterPointSchema} from "features/schemas/water-point.schema";

export type Db = any;

export class CreateWaterPointCommand implements Command<WaterPointSchema> {
    // TODO: Add repository
    constructor(private readonly db: Db) {
    }

    async handle(waterPointSchema: WaterPointSchema): Promise<void> {
        await this.db.create(waterPointSchema);
    }
}

import { Decimal } from "core";
import { Id } from "core/value-object/id.ts";
import type { WaterMeterReadingSchema } from "../schemas/water-meter-reading.schema.ts";

export class WaterMeterReading {
	private constructor(
		private readonly id: Id,
		private readonly waterMeterId: Id,
		private readonly value: Decimal,
	) {}

  static create({ id, waterMeterId, value }: WaterMeterReadingSchema) {
    return new WaterMeterReading(
      Id.create(id),
      Id.create(waterMeterId),
      Decimal.create(value),
    );
  }

  toDto() {
    return {
      id: this.id.toString(),
      waterMeterId: this.waterMeterId.toString(),
      value: this.value.toString(),
    };
  }
}

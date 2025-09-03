import { MeasurementUnit } from "core";
import { Id } from "core/value-object/id.ts";
import type { WaterMeterSchema } from "../schemas/water-meter.schema.ts";

export class WaterMeter {
	private constructor(
		private readonly id: Id,
		private readonly holderId: Id,
		private readonly waterPointId: Id,
		private readonly measurementUnit: MeasurementUnit,
		private readonly serialNumber?: string,
		private readonly images?: string[],
	) {}

	static create({
		id,
		holderId,
		waterPointId,
		measurementUnit,
		serialNumber,
		images,
	}: WaterMeterSchema) {
		return new WaterMeter(
			Id.create(id),
			Id.create(holderId),
			Id.create(waterPointId),
			MeasurementUnit.create(measurementUnit),
			serialNumber,
			images,
		);
	}
}

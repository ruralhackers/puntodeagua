
import { measurementUnitSchema } from "../types/measurement-unit.schema";


export class MeasurementUnit {
  static readonly L = MeasurementUnit.create("L");
  static readonly ML = MeasurementUnit.create("ML");
  static readonly M3 = MeasurementUnit.create("M3");

  private constructor(private readonly value: string) {}

  static create(raw: string): MeasurementUnit {
    const parsed = measurementUnitSchema.parse(raw);
    return new MeasurementUnit(parsed);
  }

  equals(other: MeasurementUnit): boolean {
    return this.value === other.value;
  }

  toString(): string { return this.value; }

}



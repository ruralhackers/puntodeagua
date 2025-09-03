import { locationSchema } from "../types/location.schema";


export class Location {
  private constructor(private readonly value: string) {}

  static create(raw: string): Location {
    const parsed =locationSchema.parse(raw)
    return new Location(parsed);
  }

  equals(other: Location): boolean {
    return this.value === other.value;
  }

  toString(): string { return this.value; }
}
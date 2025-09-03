import DecimalLib from "decimal.js";
import { decimalSchema } from "../types/decimal.schema";

DecimalLib.set({
  precision: 2,
  rounding: DecimalLib.ROUND_CEIL,
  toExpNeg: -2,
  toExpPos: 2,
});

export class Decimal {
  private readonly inner: DecimalLib;
  private readonly value: string;

  private constructor(inner: DecimalLib) {
    if (!inner.isFinite()) throw new Error("Decimal not finite");
    if (inner.isNegative()) throw new Error("Decimal cannot be negative");
    this.inner = inner;
    this.value = inner.toString(); // no canonical normalization
  }

  // Constants
  static ZERO = new Decimal(new DecimalLib(0));
  static ONE = new Decimal(new DecimalLib(1));

  // Factories
  static create(raw: string) {
    const input = decimalSchema.parse(raw); // plain string now
    let d: DecimalLib;
    try {
      d = new DecimalLib(input);
    } catch {
      throw new Error("Invalid decimal string");
    }
    return new Decimal(d);
  }

  static fromString(value: string) {
    return Decimal.create(value);
  }

  static fromNumber(n: number) {
    if (!Number.isFinite(n)) throw new Error("Non-finite number");
    if (n < 0) throw new Error("Negative not allowed");
    return Decimal.create(n.toString());
  }

  static fromUnits(value: string | number | DecimalLib | Decimal, decimals: number) {
    const base = value instanceof Decimal ? value.inner : new DecimalLib(value as any);
    if (base.isNegative()) throw new Error("Negative not allowed");
    const scaled = base.div(new DecimalLib(10).pow(decimals));
    return new Decimal(scaled);
  }

  toUnits(decimals: number) {
    const scaled = this.inner.times(new DecimalLib(10).pow(decimals));
    return new Decimal(scaled);
  }

  // Basic queries
  isZero() {
    return this.inner.isZero();
  }

  isOne() {
    return this.equals(Decimal.ONE);
  }

  isPositive() {
    return !this.isZero();
  }

  // Comparisons
  isLessThan(other: Decimal) {
    return this.inner.lt(other.inner);
  }

  isGreaterThan(other: Decimal) {
    return this.inner.gt(other.inner);
  }

  isLessThanOrEqualTo(other: Decimal) {
    return this.inner.lte(other.inner);
  }

  isGreaterThanOrEqualTo(other: Decimal) {
    return this.inner.gte(other.inner);
  }

  equals(other: Decimal) {
    return this.value === other.value;
  }

  // Arithmetic
  add(other: Decimal) {
    return new Decimal(this.inner.plus(other.inner));
  }

  subtract(other: Decimal) {
    if (this.isLessThan(other)) throw new Error("Result would be negative");
    return new Decimal(this.inner.minus(other.inner));
  }

  multiplyBy(factor: number) {
    if (factor < 0) throw new Error("Negative factor");
    return new Decimal(this.inner.times(factor));
  }

  multiplyByDecimal(multiplier: Decimal) {
    return new Decimal(this.inner.times(multiplier.inner));
  }

  divideBy(divisor: number) {
    if (divisor <= 0) throw new Error("Divisor must be > 0");
    return new Decimal(this.inner.div(divisor));
  }

  divideByDecimal(divisor: Decimal) {
    if (divisor.isZero()) throw new Error("Division by zero");
    return new Decimal(this.inner.div(divisor.inner));
  }

  min(other: Decimal) {
    return this.isLessThan(other) ? this : other;
  }

  max(other: Decimal) {
    return this.isGreaterThan(other) ? this : other;
  }

  decimals(decimals: number) {
    const d = this.inner.toDecimalPlaces(decimals, DecimalLib.ROUND_CEIL);
    return new Decimal(d);
  }

  // Conversions
  toString() {
    return this.value;
  }

  toNumber() {
    return this.inner.toNumber();
  }

}

import { Decimal, Id } from '@pda/common/domain'
import { FeeFrequency } from '../value-objects/fee-frequency'
import { FeePaymentKind } from '../value-objects/fee-payment-kind'
import { PaymentMethod } from '../value-objects/payment-method'
import type { FeePaymentCreateDto, FeePaymentDto, FeePaymentUpdateDto } from './fee-payment.dto'
import { feePaymentCreateSchema, feePaymentSchema, feePaymentUpdateSchema } from './fee-payment.dto'

export class FeePayment {
  private constructor(
    public readonly id: Id,
    public readonly communityId: Id,
    public readonly number: number,
    public waterPointId: Id,
    public payerLabel: string,
    public kind: FeePaymentKind,
    public amount: Decimal,
    public paidAt: Date,
    public frequency: FeeFrequency | null,
    public periodYear: number | null,
    public periodIndex: number | null,
    public paymentMethod: PaymentMethod,
    public notes: string
  ) {}

  static create(data: FeePaymentCreateDto & { number: number }) {
    const validated = feePaymentCreateSchema.parse(data)
    return new FeePayment(
      Id.generateUniqueId(),
      Id.fromString(validated.communityId),
      data.number,
      Id.fromString(validated.waterPointId),
      validated.payerLabel,
      FeePaymentKind.fromString(validated.kind),
      Decimal.fromString(validated.amount),
      validated.paidAt,
      validated.frequency ? FeeFrequency.fromString(validated.frequency) : null,
      validated.periodYear ?? null,
      validated.periodIndex ?? null,
      PaymentMethod.fromString(validated.paymentMethod),
      validated.notes ?? ''
    )
  }

  static fromDto(dto: FeePaymentDto): FeePayment {
    const validated = feePaymentSchema.parse(dto)
    return new FeePayment(
      Id.fromString(validated.id),
      Id.fromString(validated.communityId),
      validated.number,
      Id.fromString(validated.waterPointId),
      validated.payerLabel,
      FeePaymentKind.fromString(validated.kind),
      Decimal.fromString(validated.amount),
      validated.paidAt,
      validated.frequency ? FeeFrequency.fromString(validated.frequency) : null,
      validated.periodYear ?? null,
      validated.periodIndex ?? null,
      PaymentMethod.fromString(validated.paymentMethod),
      validated.notes ?? ''
    )
  }

  update(data: FeePaymentUpdateDto) {
    const validated = feePaymentUpdateSchema.parse(data)
    this.waterPointId = Id.fromString(validated.waterPointId)
    this.payerLabel = validated.payerLabel
    this.kind = FeePaymentKind.fromString(validated.kind)
    this.amount = Decimal.fromString(validated.amount)
    this.paidAt = validated.paidAt
    this.frequency = validated.frequency ? FeeFrequency.fromString(validated.frequency) : null
    this.periodYear = validated.periodYear ?? null
    this.periodIndex = validated.periodIndex ?? null
    this.paymentMethod = PaymentMethod.fromString(validated.paymentMethod)
    this.notes = validated.notes ?? ''
    return this
  }

  toDto(): FeePaymentDto {
    return {
      id: this.id.toString(),
      communityId: this.communityId.toString(),
      number: this.number,
      waterPointId: this.waterPointId.toString(),
      payerLabel: this.payerLabel,
      kind: this.kind.toString(),
      amount: this.amount.toString(),
      paidAt: this.paidAt,
      frequency: this.frequency?.toString() ?? null,
      periodYear: this.periodYear,
      periodIndex: this.periodIndex,
      paymentMethod: this.paymentMethod.toString(),
      notes: this.notes
    }
  }
}

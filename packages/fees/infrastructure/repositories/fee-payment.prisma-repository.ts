import type { Id } from '@pda/common/domain'
import { BasePrismaRepository } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { FeePayment } from '../../domain/entities/fee-payment'
import type {
  FeePaymentListFilters,
  FeePaymentRepository
} from '../../domain/repositories/fee-payment.repository'

export class FeePaymentPrismaRepository
  extends BasePrismaRepository
  implements FeePaymentRepository
{
  protected readonly model = 'feePayment'

  protected getModel() {
    return this.db.feePayment
  }

  constructor(db: typeof prisma) {
    super(db)
  }

  async findById(id: Id) {
    const payment = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return payment ? FeePayment.fromDto(this.fromPrismaPayload(payment)) : undefined
  }

  async findByCommunityId(filters: FeePaymentListFilters) {
    const where: Prisma.FeePaymentWhereInput = {
      communityId: filters.communityId.toString()
    }

    if (filters.waterPointId) {
      where.waterPointId = filters.waterPointId.toString()
    }
    if (filters.kind) {
      where.kind = filters.kind
    }
    if (filters.year != null) {
      where.periodYear = filters.year
    }
    if (filters.paidAtFrom || filters.paidAtTo) {
      where.paidAt = {}
      if (filters.paidAtFrom) {
        where.paidAt.gte = filters.paidAtFrom
      }
      if (filters.paidAtTo) {
        where.paidAt.lte = filters.paidAtTo
      }
    }

    const payments = await this.getModel().findMany({
      where,
      orderBy: [{ number: 'desc' }]
    })

    return payments.map((payment: Prisma.FeePaymentGetPayload<Record<string, never>>) =>
      FeePayment.fromDto(this.fromPrismaPayload(payment))
    )
  }

  async getNextNumber(communityId: Id): Promise<number> {
    const result = await this.getModel().aggregate({
      where: { communityId: communityId.toString() },
      _max: { number: true }
    })
    return (result._max.number ?? 0) + 1
  }

  async createWithNextNumber(
    communityId: Id,
    build: (number: number) => FeePayment
  ): Promise<FeePayment> {
    return this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      const result = await tx.feePayment.aggregate({
        where: { communityId: communityId.toString() },
        _max: { number: true }
      })
      const number = (result._max.number ?? 0) + 1
      const feePayment = build(number)
      await tx.feePayment.create({
        data: {
          id: feePayment.id.toString(),
          communityId: feePayment.communityId.toString(),
          number: feePayment.number,
          waterPointId: feePayment.waterPointId.toString(),
          payerLabel: feePayment.payerLabel,
          kind: feePayment.kind.toString(),
          amount: feePayment.amount.toString(),
          paidAt: feePayment.paidAt,
          frequency: feePayment.frequency?.toString() ?? null,
          periodYear: feePayment.periodYear,
          periodIndex: feePayment.periodIndex,
          paymentMethod: feePayment.paymentMethod.toString(),
          notes: feePayment.notes
        }
      })
      return feePayment
    })
  }

  async save(feePayment: FeePayment) {
    const data = {
      communityId: feePayment.communityId.toString(),
      number: feePayment.number,
      waterPointId: feePayment.waterPointId.toString(),
      payerLabel: feePayment.payerLabel,
      kind: feePayment.kind.toString(),
      amount: feePayment.amount.toString(),
      paidAt: feePayment.paidAt,
      frequency: feePayment.frequency?.toString() ?? null,
      periodYear: feePayment.periodYear,
      periodIndex: feePayment.periodIndex,
      paymentMethod: feePayment.paymentMethod.toString(),
      notes: feePayment.notes,
      updatedAt: new Date()
    }

    await this.getModel().upsert({
      where: { id: feePayment.id.toString() },
      create: {
        ...data,
        id: feePayment.id.toString()
      },
      update: {
        waterPointId: data.waterPointId,
        payerLabel: data.payerLabel,
        kind: data.kind,
        amount: data.amount,
        paidAt: data.paidAt,
        frequency: data.frequency,
        periodYear: data.periodYear,
        periodIndex: data.periodIndex,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        updatedAt: data.updatedAt
      }
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  private fromPrismaPayload(payload: Prisma.FeePaymentGetPayload<Record<string, never>>) {
    return {
      id: payload.id,
      communityId: payload.communityId,
      number: payload.number,
      waterPointId: payload.waterPointId,
      payerLabel: payload.payerLabel,
      kind: payload.kind,
      amount: payload.amount.toString(),
      paidAt: payload.paidAt,
      frequency: payload.frequency,
      periodYear: payload.periodYear,
      periodIndex: payload.periodIndex,
      paymentMethod: payload.paymentMethod,
      notes: payload.notes
    }
  }
}

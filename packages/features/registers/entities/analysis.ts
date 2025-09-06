import { DateTime, Decimal, Id } from 'core'
import type { AnalysisSchema } from '../schemas/analysis.schema'
import { AnalysisType } from '../value-objects/analysis-type'
import type { AnalysisDto } from './analysis.dto'

export class Analysis {
  private constructor(
    public readonly id: Id,
    public readonly waterZoneId: Id,
    public readonly analysisType: AnalysisType,
    public analyst: string,
    public analyzedAt: DateTime,
    public ph: Decimal | undefined = undefined,
    public turbidity: Decimal | undefined = undefined,
    public chlorine: Decimal | undefined = undefined,
    public description: string | undefined = undefined
  ) {}

  static create(schema: Omit<AnalysisSchema, 'id'>) {
    return new Analysis(
      Id.generateUniqueId(),
      Id.create(schema.waterZoneId),
      AnalysisType.create(schema.analysisType),
      schema.analyst,
      DateTime.fromISO(schema.analyzedAt),
      schema.ph ? Decimal.fromString(schema.ph) : undefined,
      schema.turbidity ? Decimal.fromString(schema.turbidity) : undefined,
      schema.chlorine ? Decimal.fromString(schema.chlorine) : undefined,
      schema.description ?? undefined
    )
  }

  static fromDto(dto: AnalysisSchema): Analysis {
    return new Analysis(
      Id.create(dto.id),
      Id.create(dto.waterZoneId),
      AnalysisType.create(dto.analysisType),
      dto.analyst,
      DateTime.fromISO(dto.analyzedAt),
      dto.ph ? Decimal.fromString(dto.ph) : undefined,
      dto.turbidity ? Decimal.fromString(dto.turbidity) : undefined,
      dto.chlorine ? Decimal.fromString(dto.chlorine) : undefined,
      dto.description ?? undefined
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      waterZoneId: this.waterZoneId.toString(),
      analysisType: this.analysisType.toString(),
      analyst: this.analyst,
      analyzedAt: this.analyzedAt.toISO(),
      ph: this.ph?.toString(),
      turbidity: this.turbidity?.toString(),
      chlorine: this.chlorine?.toString(),
      description: this.description
    }
  }
}

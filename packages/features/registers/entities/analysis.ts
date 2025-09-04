import { Decimal, Id } from 'core'
import type { AnalysisSchema } from '../schemas/analysis.schema'
import { AnalysisType } from '../value-objects/analysis-type'

export class Analysis {
  private constructor(
    public readonly id: Id,
    public readonly waterZoneId: Id,
    public readonly analysisType: AnalysisType,
    public analyst: string,
    public analyzedAt: Date,
    public ph: Decimal | undefined = undefined,
    public turbidity: Decimal | undefined = undefined,
    public chlorine: Decimal | undefined = undefined,
    public description: string | undefined = undefined
  ) {}

  static create(analysisSchema: Omit<AnalysisSchema, 'id'>) {
    return new Analysis(
      Id.generateUniqueId(),
      Id.create(analysisSchema.waterZoneId),
      AnalysisType.create(analysisSchema.analysisType),
      analysisSchema.analyst,
      analysisSchema.analyzedAt,
      analysisSchema.ph ? Decimal.fromString(analysisSchema.ph) : undefined,
      analysisSchema.turbidity ? Decimal.fromString(analysisSchema.turbidity) : undefined,
      analysisSchema.chlorine ? Decimal.fromString(analysisSchema.chlorine) : undefined,
      analysisSchema.description ?? undefined
    )
  }

  static fromDto(dto: AnalysisSchema): Analysis {
    return new Analysis(
      Id.create(dto.id),
      Id.create(dto.waterZoneId),
      AnalysisType.create(dto.analysisType),
      dto.analyst,
      dto.analyzedAt,
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
      analyzedAt: this.analyzedAt,
      ph: this.ph?.toString(),
      turbidity: this.turbidity?.toString(),
      chlorine: this.chlorine?.toString(),
      description: this.description
    }
  }
}

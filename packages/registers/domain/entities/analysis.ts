import { Id } from '@pda/common/domain'
import { AnalysisType } from '../value-objects/analysis-type'
import type { AnalysisDto } from './analysis.dto'

export class Analysis {
  private constructor(
    public readonly id: Id,
    public readonly communityId: Id,
    public readonly analysisType: AnalysisType,
    public readonly analyst: string,
    public readonly analyzedAt: Date,
    public readonly waterZoneId?: Id,
    public readonly waterDepositId?: Id,
    public readonly ph?: number,
    public readonly turbidity?: number,
    public readonly chlorine?: number,
    public readonly description?: string
  ) {}

  static create(dto: Omit<AnalysisDto, 'id'>) {
    return new Analysis(
      Id.generateUniqueId(),
      Id.fromString(dto.communityId),
      AnalysisType.fromString(dto.analysisType),
      dto.analyst,
      dto.analyzedAt,
      dto.waterZoneId ? Id.fromString(dto.waterZoneId) : undefined,
      dto.waterDepositId ? Id.fromString(dto.waterDepositId) : undefined,
      dto.ph,
      dto.turbidity,
      dto.chlorine,
      dto.description
    )
  }

  static fromDto(dto: AnalysisDto) {
    return new Analysis(
      Id.fromString(dto.id),
      Id.fromString(dto.communityId),
      AnalysisType.fromString(dto.analysisType),
      dto.analyst,
      dto.analyzedAt,
      dto.waterZoneId ? Id.fromString(dto.waterZoneId) : undefined,
      dto.waterDepositId ? Id.fromString(dto.waterDepositId) : undefined,
      dto.ph,
      dto.turbidity,
      dto.chlorine,
      dto.description
    )
  }

  toDto(): AnalysisDto {
    return {
      id: this.id.toString(),
      communityId: this.communityId.toString(),
      analysisType: this.analysisType.toString(),
      analyst: this.analyst,
      analyzedAt: this.analyzedAt,
      waterZoneId: this.waterZoneId?.toString(),
      waterDepositId: this.waterDepositId?.toString(),
      ph: this.ph,
      turbidity: this.turbidity,
      chlorine: this.chlorine,
      description: this.description
    }
  }
}

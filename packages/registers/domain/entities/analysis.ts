import { Id } from '@pda/common/domain'
import { AnalysisType } from '../value-objects/analysis-type'
import { type AnalysisDto, analysisSchema } from './analysis.dto'

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
    const validatedData = analysisSchema.omit({ id: true }).parse(dto)
    // if analysis type is chlorine_ph, then ph and chlorine must be provided
    // if analysis type is turbidity, then turbidity must be provided
    // if analysis type is hardness, then ph must be provided
    // if analysis type is complete, then ph, chlorine and turbidity must be provided

    const analysisType = AnalysisType.fromString(validatedData.analysisType)
    if (analysisType.equals(AnalysisType.CHLORINE_PH) && validatedData.ph === undefined) {
      throw new Error('Ph is required for chlorine_ph analysis')
    }
    if (analysisType.equals(AnalysisType.TURBIDITY) && validatedData.turbidity === undefined) {
      throw new Error('Turbidity is required for turbidity analysis')
    }
    if (analysisType.equals(AnalysisType.HARDNESS) && validatedData.ph === undefined) {
      throw new Error('Ph is required for hardness analysis')
    }
    if (
      analysisType.equals(AnalysisType.COMPLETE) &&
      (validatedData.ph === undefined ||
        validatedData.chlorine === undefined ||
        validatedData.turbidity === undefined)
    ) {
      throw new Error('Ph, chlorine and turbidity are required for complete analysis')
    }

    return new Analysis(
      Id.generateUniqueId(),
      Id.fromString(validatedData.communityId),
      analysisType,
      validatedData.analyst,
      validatedData.analyzedAt,
      validatedData.waterZoneId ? Id.fromString(validatedData.waterZoneId) : undefined,
      validatedData.waterDepositId ? Id.fromString(validatedData.waterDepositId) : undefined,
      validatedData.ph,
      validatedData.turbidity,
      validatedData.chlorine,
      validatedData.description
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

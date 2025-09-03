import { Decimal, Id } from "core";
import type { AnalysisSchema } from "../schemas/analysis.schema";
import { AnalysisType } from "../value-objects/analysis-type";

export class Analysis {
  private constructor(
    public readonly id: Id,
    public readonly waterZoneId: Id,
    public readonly analysisType: AnalysisType,
    public analyst: string,
    public analyzedAt: Date,
    public ph: Decimal | null = null,
    public turbidity: Decimal | null = null,
    public chlorine: Decimal | null = null,
    public description: string | null = null
  ) {}

  static create(analysisSchema: Omit<AnalysisSchema, "id">) {
    return new Analysis(
      Id.generateUniqueId(),
      Id.create(analysisSchema.waterZoneId),
      AnalysisType.create(analysisSchema.analysisType),
      analysisSchema.analyst,
      analysisSchema.analyzedAt,
      analysisSchema.ph ? Decimal.fromString(analysisSchema.ph) : null,
      analysisSchema.turbidity ? Decimal.fromString(analysisSchema.turbidity) : null,
      analysisSchema.chlorine ? Decimal.fromString(analysisSchema.chlorine) : null,
      analysisSchema.description ?? null
    );
  }

  toDto() {
    return {
      id: this.id.toString(),
      waterZoneId: this.waterZoneId.toString(),
      analysisType: this.analysisType,
      analyst: this.analyst,
      analyzedAt: this.analyzedAt,
      ph: this.ph?.toString(),
      turbidity: this.turbidity?.toString(),
      chlorine: this.chlorine?.toString(),
      description: this.description
    };
  }
}

export interface AnalysisDto {
  id: string
  waterZoneId: string
  analysisType: string
  analyst: string
  analyzedAt: Date
  ph?: string
  chlorine?: string
  turbidity?: string
  description?: string
}

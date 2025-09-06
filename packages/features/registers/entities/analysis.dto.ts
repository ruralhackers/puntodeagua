export interface AnalysisDto {
  id: string
  waterZoneId: string
  analysisType: string
  analyst: string
  analyzedAt: string
  ph?: string
  chlorine?: string
  turbidity?: string
  description?: string
}

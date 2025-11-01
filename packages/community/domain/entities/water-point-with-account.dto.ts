export interface WaterPointWithAccountDto {
  id: string
  name: string
  location: string
  notes?: string
  fixedPopulation: number
  floatingPopulation: number
  cadastralReference: string
  communityZoneId: string
  waterDepositIds: string[]
  waterAccountName: string | null
}

export interface WaterPointDto {
  id: string
  communityId: string
  name: string
  location: string
  description?: string
  fixedPopulation: number
  floatingPopulation: number
}

export interface CommunitySeedData {
  community: {
    name: string
    waterLimitRule: {
      type: string
      value: number
    }
  }
  deposits: Array<{
    name: string
    location: string
    notes: string
  }>
  zones: Array<{
    name: string
    notes: string
  }>
  users: Array<{
    email: string
    name: string
    password: string
    roles: string[]
  }>
  waterAccounts: Array<{
    tempId: string
    name: string
    nationalId: string
    notes: string
  }>
  waterPoints: Array<{
    tempId: string
    name: string
    location: string
    zone: string
    cadastralReference: string
    fixedPopulation: number
    floatingPopulation: number
    notes: string
  }>
  waterMeters: Array<{
    name: string
    waterAccountId: string
    waterPointId: string
    measurementUnit: string
    isActive: boolean
    readings: Array<{
      reading: number
      readingDate: string
      notes: string
    }>
  }>
}

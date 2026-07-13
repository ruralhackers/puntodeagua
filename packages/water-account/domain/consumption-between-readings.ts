import { differenceInMinutes } from 'date-fns'

export interface ReadingForConsumption {
  normalizedReading: number
  readingDate: Date
}

export interface ConsumptionBetweenReadings {
  consumptionLiters: number
  hoursBetween: number
  daysBetween: number
  dailyConsumption: number
}

export function consumptionBetweenReadings(
  latest: ReadingForConsumption,
  previous: ReadingForConsumption
): ConsumptionBetweenReadings {
  const hoursBetween = differenceInMinutes(latest.readingDate, previous.readingDate) / 60
  const daysBetween = hoursBetween / 24
  const consumptionLiters = latest.normalizedReading - previous.normalizedReading
  const dailyConsumption = consumptionLiters / daysBetween

  return {
    consumptionLiters,
    hoursBetween,
    daysBetween,
    dailyConsumption
  }
}

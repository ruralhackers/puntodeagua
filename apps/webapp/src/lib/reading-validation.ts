export type ReadingValidationField = 'reading' | 'date'

export interface ReadingValidationError {
  field: ReadingValidationField
  message: string
}

export interface ValidateReadingInput {
  /** Reading already parsed and normalized to litres by the caller. */
  normalizedReading: number
  readingDate: Date
  lastReadingValue: number | null
  lastReadingDate: Date | null
  now: Date
}

export function validateReading({
  normalizedReading,
  readingDate,
  lastReadingValue,
  lastReadingDate,
  now
}: ValidateReadingInput): ReadingValidationError | null {
  if (readingDate > now) {
    return { field: 'date', message: 'La fecha y hora no pueden ser futuras' }
  }

  if (lastReadingDate && readingDate <= new Date(lastReadingDate)) {
    return { field: 'date', message: 'La nueva lectura debe ser posterior a la última lectura' }
  }

  if (lastReadingValue !== null && normalizedReading < lastReadingValue) {
    return {
      field: 'reading',
      message: 'La nueva lectura no puede ser menor que la última lectura'
    }
  }

  return null
}

/**
 * Value object que encapsula las reglas de negocio para determinar
 * si una lectura de medidor de agua es considerada antigua o crítica
 */
export class ReadingAgeThreshold {
  private static readonly OLD_READING_DAYS = 90
  private static readonly CRITICAL_READING_DAYS = 180

  /**
   * Determina si una lectura es considerada antigua
   * @param daysSinceReading - Días transcurridos desde la última lectura
   * @returns true si la lectura es antigua (más de 30 días)
   */
  static isOldReading(daysSinceReading: number | null): boolean {
    return daysSinceReading !== null && daysSinceReading > ReadingAgeThreshold.OLD_READING_DAYS
  }

  /**
   * Determina si una lectura es considerada crítica
   * @param daysSinceReading - Días transcurridos desde la última lectura
   * @returns true si la lectura es crítica (más de 90 días)
   */
  static isCriticalReading(daysSinceReading: number | null): boolean {
    return daysSinceReading !== null && daysSinceReading > ReadingAgeThreshold.CRITICAL_READING_DAYS
  }

  /**
   * Obtiene el umbral en días para considerar una lectura como antigua
   * @returns Número de días (30)
   */
  static getOldReadingThreshold(): number {
    return ReadingAgeThreshold.OLD_READING_DAYS
  }

  /**
   * Obtiene el umbral en días para considerar una lectura como crítica
   * @returns Número de días (90)
   */
  static getCriticalReadingThreshold(): number {
    return ReadingAgeThreshold.CRITICAL_READING_DAYS
  }

  /**
   * Obtiene el estado de una lectura basado en los días transcurridos
   * @param daysSinceReading - Días transcurridos desde la última lectura
   * @returns Estado de la lectura: 'none', 'old', 'critical'
   */
  static getReadingStatus(daysSinceReading: number | null): 'none' | 'old' | 'critical' {
    if (daysSinceReading === null) {
      return 'none'
    }

    if (ReadingAgeThreshold.isCriticalReading(daysSinceReading)) {
      return 'critical'
    }

    if (ReadingAgeThreshold.isOldReading(daysSinceReading)) {
      return 'old'
    }

    return 'none'
  }
}

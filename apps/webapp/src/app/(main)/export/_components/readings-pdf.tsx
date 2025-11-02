import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

interface ReadingData {
  normalizedReading: number
  readingDate: Date
}

interface WaterMeterReadingData {
  id: string
  name: string
  waterAccountName: string
  isActive: boolean
  readings: ReadingData[]
  waterPoint: {
    name: string
    fixedPopulation: number
    floatingPopulation: number
  }
  waterLimitRule: {
    type: string
    value: number
  }
  communityZone: {
    name: string
  }
}

interface ReadingsPDFProps {
  data: WaterMeterReadingData[]
  startDate: string
  endDate: string
  generatedAt: string
}

// Definir estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 8,
    lineHeight: 1.3
  },
  header: {
    marginBottom: 15,
    borderBottom: '2 solid #3b82f6',
    paddingBottom: 8
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2
  },
  summary: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 4
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#374151'
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 3
  },
  summaryLabel: {
    fontWeight: 'bold',
    width: 100,
    color: '#4b5563'
  },
  summaryValue: {
    color: '#6b7280'
  },
  table: {
    marginTop: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 6,
    fontWeight: 'bold',
    fontSize: 7,
    borderBottom: '1 solid #3b82f6'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    padding: 6,
    fontSize: 7
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    padding: 6,
    fontSize: 7,
    backgroundColor: '#f9fafb'
  },
  cellName: {
    width: '20%',
    paddingRight: 4
  },
  cellReading: {
    width: '15%',
    paddingRight: 4
  },
  cellConsumption: {
    width: '15%',
    paddingRight: 4
  },
  cellTotal: {
    width: '12%',
    paddingRight: 4
  },
  cellMax: {
    width: '12%',
    paddingRight: 4
  },
  cellExcess: {
    width: '8%',
    textAlign: 'center'
  },
  excessBadge: {
    color: '#dc2626',
    fontWeight: 'bold'
  },
  okBadge: {
    color: '#16a34a',
    fontWeight: 'bold'
  },
  insufficientData: {
    color: '#9ca3af',
    fontStyle: 'italic'
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 7,
    color: '#9ca3af',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 8
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 20,
    fontSize: 7,
    color: '#9ca3af'
  }
})

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatNumber = (num: number) => {
  return num.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

export function ReadingsPDF({ data, startDate, endDate, generatedAt }: ReadingsPDFProps) {
  const totalMeters = data.length
  const metersWithReadings = data.filter((meter) => meter.readings.length >= 2).length
  const metersWithInsufficientData = data.filter((meter) => meter.readings.length < 2).length

  // Calcular contadores con exceso
  const metersWithExcess = data.filter((meter) => {
    if (meter.readings.length < 2) return false

    const lastReading = meter.readings[meter.readings.length - 1]
    const firstReading = meter.readings[0]

    if (!lastReading || !firstReading) return false

    const consumption = lastReading.normalizedReading - firstReading.normalizedReading
    const days = Math.floor(
      (new Date(lastReading.readingDate).getTime() - new Date(firstReading.readingDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (days <= 0) return false

    const pax = meter.waterPoint.fixedPopulation + meter.waterPoint.floatingPopulation
    let maxAllowed = 0

    if (meter.waterLimitRule.type === 'PERSON_BASED') {
      maxAllowed = days * pax * meter.waterLimitRule.value
    } else if (meter.waterLimitRule.type === 'HOUSEHOLD_BASED') {
      maxAllowed = days * meter.waterLimitRule.value
    }

    return consumption > maxAllowed
  }).length

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Lecturas de Contadores</Text>
          <Text style={styles.subtitle}>Generado el {generatedAt}</Text>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen de la Exportación</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Período:</Text>
            <Text style={styles.summaryValue}>
              {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Contadores:</Text>
            <Text style={styles.summaryValue}>{totalMeters}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Con Datos Suficientes:</Text>
            <Text style={styles.summaryValue}>{metersWithReadings}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sin Datos Suficientes:</Text>
            <Text style={styles.summaryValue}>{metersWithInsufficientData}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Contadores con Exceso:</Text>
            <Text style={styles.summaryValue}>{metersWithExcess}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.cellName}>Titular - Zona</Text>
            <Text style={styles.cellReading}>Consumo Anterior</Text>
            <Text style={styles.cellReading}>Último Consumo</Text>
            <Text style={styles.cellConsumption}>Consumo Total</Text>
            <Text style={styles.cellTotal}>Total Gasto (L)</Text>
            <Text style={styles.cellMax}>Máx. Permitido (L)</Text>
            <Text style={styles.cellExcess}>Exceso</Text>
          </View>

          {/* Table Rows */}
          {data.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.cellName, { width: '100%' }]}>
                No se encontraron contadores con lecturas en el período seleccionado.
              </Text>
            </View>
          ) : (
            data.map((meter, index) => {
              const hasInsufficientData = meter.readings.length < 2
              const isAlt = index % 2 === 1

              if (hasInsufficientData) {
                return (
                  <View key={meter.id} style={isAlt ? styles.tableRowAlt : styles.tableRow}>
                    <Text style={styles.cellName}>
                      {meter.waterAccountName} - {meter.communityZone.name}
                    </Text>
                    <Text style={[styles.cellReading, styles.insufficientData]}>
                      {meter.readings.length === 1 ? 'Solo 1 lectura' : 'Sin lecturas'}
                    </Text>
                    <Text style={[styles.cellReading, styles.insufficientData]}>-</Text>
                    <Text style={[styles.cellConsumption, styles.insufficientData]}>
                      Datos insuficientes
                    </Text>
                    <Text style={[styles.cellTotal, styles.insufficientData]}>-</Text>
                    <Text style={[styles.cellMax, styles.insufficientData]}>-</Text>
                    <Text style={styles.cellExcess}>-</Text>
                  </View>
                )
              }

              // Tiene al menos 2 lecturas
              const firstReading = meter.readings[0]
              const lastReading = meter.readings[meter.readings.length - 1]

              if (!firstReading || !lastReading) return null

              const totalConsumption =
                lastReading.normalizedReading - firstReading.normalizedReading
              const days = Math.floor(
                (new Date(lastReading.readingDate).getTime() -
                  new Date(firstReading.readingDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )

              const pax = meter.waterPoint.fixedPopulation + meter.waterPoint.floatingPopulation
              let maxAllowed = 0

              if (meter.waterLimitRule.type === 'PERSON_BASED') {
                maxAllowed = days * pax * meter.waterLimitRule.value
              } else if (meter.waterLimitRule.type === 'HOUSEHOLD_BASED') {
                maxAllowed = days * meter.waterLimitRule.value
              }

              const hasExcess = totalConsumption > maxAllowed

              // Si hay más de 2 lecturas, mostrar las intermedias
              const hasMultipleReadings = meter.readings.length > 2

              return (
                <View key={meter.id} style={isAlt ? styles.tableRowAlt : styles.tableRow}>
                  <Text style={styles.cellName}>
                    {meter.waterAccountName} - {meter.communityZone.name}
                  </Text>
                  <Text style={styles.cellReading}>
                    {formatNumber(firstReading.normalizedReading)} L{'\n'}
                    {formatDate(firstReading.readingDate)}
                  </Text>
                  <Text style={styles.cellReading}>
                    {formatNumber(lastReading.normalizedReading)} L{'\n'}
                    {formatDate(lastReading.readingDate)}
                    {hasMultipleReadings && (
                      <Text style={{ fontSize: 6, color: '#9ca3af' }}>
                        {'\n'}(+{meter.readings.length - 2} lectura
                        {meter.readings.length - 2 > 1 ? 's' : ''} intermedia
                        {meter.readings.length - 2 > 1 ? 's' : ''})
                      </Text>
                    )}
                  </Text>
                  <Text style={styles.cellConsumption}>
                    {formatNumber(totalConsumption)} L{'\n'}en {days} días
                  </Text>
                  <Text style={styles.cellTotal}>{formatNumber(totalConsumption)} L</Text>
                  <Text style={styles.cellMax}>{formatNumber(maxAllowed)} L</Text>
                  <Text
                    style={[styles.cellExcess, hasExcess ? styles.excessBadge : styles.okBadge]}
                  >
                    {hasExcess ? 'SÍ' : 'NO'}
                  </Text>
                </View>
              )
            })
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Sistema de Gestión de Agua - Reporte de Lecturas</Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}

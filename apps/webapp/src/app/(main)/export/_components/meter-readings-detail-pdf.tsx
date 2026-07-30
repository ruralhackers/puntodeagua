import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

interface ReadingData {
  normalizedReading: number
  readingDate: Date
}

interface MeterReadingsDetailData {
  id: string
  name: string
  waterAccountName: string
  readings: ReadingData[]
  totalConsumption: number | null
  days: number | null
  averageConsumptionPerDay: number | null
  waterPoint: {
    name: string
    connectionNumber?: string | null
  }
  communityZone: {
    name: string
  }
}

interface MeterReadingsDetailPDFProps {
  data: MeterReadingsDetailData
  startDate: string
  endDate: string
  generatedAt: string
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 24,
    fontSize: 9,
    lineHeight: 1.4
  },
  header: {
    marginBottom: 16,
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
  meta: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 4
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 3
  },
  metaLabel: {
    fontWeight: 'bold',
    width: 120,
    color: '#4b5563'
  },
  metaValue: {
    color: '#6b7280',
    flex: 1
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 6,
    fontWeight: 'bold',
    fontSize: 8,
    borderBottom: '1 solid #3b82f6'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    padding: 6,
    fontSize: 8
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    padding: 6,
    fontSize: 8,
    backgroundColor: '#f9fafb'
  },
  colDate: { width: '25%' },
  colReading: { width: '25%' },
  colDelta: { width: '25%' },
  colIndex: { width: '25%' },
  summary: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 4
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#166534'
  },
  empty: {
    marginTop: 20,
    color: '#9ca3af',
    fontStyle: 'italic'
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
    textAlign: 'center',
    fontSize: 7,
    color: '#9ca3af',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 8
  }
})

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatNumber = (num: number) => num.toLocaleString('es-ES', { maximumFractionDigits: 2 })

export function MeterReadingsDetailPDF({
  data,
  startDate,
  endDate,
  generatedAt
}: MeterReadingsDetailPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Lecturas del Contador</Text>
          <Text style={styles.subtitle}>
            Período: {formatDate(startDate)} — {formatDate(endDate)}
          </Text>
          <Text style={styles.subtitle}>Generado: {generatedAt}</Text>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Titular</Text>
            <Text style={styles.metaValue}>{data.waterAccountName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Punto de agua</Text>
            <Text style={styles.metaValue}>{data.waterPoint.name}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Nº enganche</Text>
            <Text style={styles.metaValue}>{data.waterPoint.connectionNumber || '—'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Zona</Text>
            <Text style={styles.metaValue}>{data.communityZone.name}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Lecturas</Text>
            <Text style={styles.metaValue}>{data.readings.length}</Text>
          </View>
        </View>

        {data.readings.length === 0 ? (
          <Text style={styles.empty}>No hay lecturas en el período seleccionado.</Text>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.colIndex}>#</Text>
              <Text style={styles.colDate}>Fecha</Text>
              <Text style={styles.colReading}>Lectura (L)</Text>
              <Text style={styles.colDelta}>Consumo desde anterior (L)</Text>
            </View>
            {data.readings.map((reading, index) => {
              const previous = index > 0 ? data.readings[index - 1] : undefined
              const delta = previous ? reading.normalizedReading - previous.normalizedReading : null
              const rowStyle = index % 2 === 0 ? styles.tableRow : styles.tableRowAlt
              return (
                <View key={`${reading.readingDate}-${index}`} style={rowStyle}>
                  <Text style={styles.colIndex}>{index + 1}</Text>
                  <Text style={styles.colDate}>{formatDate(reading.readingDate)}</Text>
                  <Text style={styles.colReading}>{formatNumber(reading.normalizedReading)}</Text>
                  <Text style={styles.colDelta}>{delta === null ? '—' : formatNumber(delta)}</Text>
                </View>
              )
            })}
          </>
        )}

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen del período</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Consumo total</Text>
            <Text style={styles.metaValue}>
              {data.totalConsumption === null ? '—' : `${formatNumber(data.totalConsumption)} L`}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Días</Text>
            <Text style={styles.metaValue}>{data.days === null ? '—' : String(data.days)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Consumo medio</Text>
            <Text style={styles.metaValue}>
              {data.averageConsumptionPerDay === null
                ? '—'
                : `${formatNumber(data.averageConsumptionPerDay)} L/día`}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>Punto de Agua — reporte de lecturas por contador</Text>
      </Page>
    </Document>
  )
}

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { ANALYSIS_TYPE_OPTIONS } from '@/constants/analysis-types'

// Definir estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    lineHeight: 1.4
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 3
  },
  summary: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 5
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151'
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  summaryLabel: {
    fontWeight: 'bold',
    width: 120,
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
    backgroundColor: '#e5e7eb',
    padding: 8,
    borderBottom: '1 solid #d1d5db'
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    padding: 6,
    minHeight: 25
  },
  tableRowEven: {
    backgroundColor: '#f9fafb'
  },
  tableCell: {
    fontSize: 8,
    color: '#374151',
    textAlign: 'left',
    paddingHorizontal: 2
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 30,
    fontSize: 8,
    color: '#9ca3af'
  }
})

// Definir anchos de columnas (en porcentaje)
const columnWidths = {
  type: '15%',
  analyst: '15%',
  date: '15%',
  community: '18%',
  zone: '12%',
  deposit: '15%',
  ph: '8%',
  chlorine: '8%',
  turbidity: '10%'
}

interface AnalysisData {
  id: string
  analysisType: string
  analyst: string
  analyzedAt: string | Date
  communityName: string
  zoneName?: string
  depositName?: string
  ph?: number
  chlorine?: number
  turbidity?: number
  description?: string
}

interface AnalysisPDFProps {
  data: AnalysisData[]
  selectedTypes: string[]
  startDate: string
  endDate: string
  generatedAt: string
}

export function AnalysisPDF({
  data,
  selectedTypes,
  startDate,
  endDate,
  generatedAt
}: AnalysisPDFProps) {
  const selectedTypesOptions = selectedTypes
    .map((type) => ANALYSIS_TYPE_OPTIONS.find((opt) => opt.value.toString() === type))
    .filter(Boolean)

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAnalysisTypeLabel = (type: string) => {
    const option = ANALYSIS_TYPE_OPTIONS.find((opt) => opt.value.toString() === type)
    return option ? option.label : type
  }

  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-'
    return value.toString()
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Análisis de Agua</Text>
          <Text style={styles.subtitle}>Sistema Punto de Agua</Text>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen de la Exportación</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Período:</Text>
            <Text style={styles.summaryValue}>
              {new Date(startDate).toLocaleDateString('es-ES')} -{' '}
              {new Date(endDate).toLocaleDateString('es-ES')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tipos de Análisis:</Text>
            <Text style={styles.summaryValue}>
              {selectedTypesOptions.map((opt) => opt?.label).join(', ')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Registros:</Text>
            <Text style={styles.summaryValue}>{data.length}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fecha de Generación:</Text>
            <Text style={styles.summaryValue}>{generatedAt}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: columnWidths.type }]}>Tipo</Text>
            <Text style={[styles.tableHeaderCell, { width: columnWidths.analyst }]}>Analista</Text>
            <Text style={[styles.tableHeaderCell, { width: columnWidths.date }]}>Fecha</Text>
            <Text style={[styles.tableHeaderCell, { width: columnWidths.community }]}>
              Comunidad
            </Text>
            <Text style={[styles.tableHeaderCell, { width: columnWidths.zone }]}>Zona</Text>
            <Text style={[styles.tableHeaderCell, { width: columnWidths.deposit }]}>Depósito</Text>
            <Text style={[styles.tableHeaderCell, { width: columnWidths.ph }]}>pH</Text>
            <Text style={[styles.tableHeaderCell, { width: columnWidths.chlorine }]}>Cloro</Text>
            <Text style={[styles.tableHeaderCell, { width: columnWidths.turbidity }]}>
              Turbidez
            </Text>
          </View>

          {/* Table Rows */}
          {data.map((analysis, index) => (
            <View
              key={analysis.id}
              style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}
            >
              <Text style={[styles.tableCell, { width: columnWidths.type }]}>
                {getAnalysisTypeLabel(analysis.analysisType)}
              </Text>
              <Text style={[styles.tableCell, { width: columnWidths.analyst }]}>
                {analysis.analyst}
              </Text>
              <Text style={[styles.tableCell, { width: columnWidths.date }]}>
                {formatDate(analysis.analyzedAt)}
              </Text>
              <Text style={[styles.tableCell, { width: columnWidths.community }]}>
                {analysis.communityName}
              </Text>
              <Text style={[styles.tableCell, { width: columnWidths.zone }]}>
                {analysis.zoneName || '-'}
              </Text>
              <Text style={[styles.tableCell, { width: columnWidths.deposit }]}>
                {analysis.depositName || '-'}
              </Text>
              <Text style={[styles.tableCell, { width: columnWidths.ph }]}>
                {formatValue(analysis.ph)}
              </Text>
              <Text style={[styles.tableCell, { width: columnWidths.chlorine }]}>
                {formatValue(analysis.chlorine)}
              </Text>
              <Text style={[styles.tableCell, { width: columnWidths.turbidity }]}>
                {formatValue(analysis.turbidity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Este reporte fue generado automáticamente por el Sistema Punto de Agua</Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </Page>
    </Document>
  )
}

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
  analysesContainer: {
    marginTop: 10
  },
  analysisCard: {
    border: '1 solid #dbeafe',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fefefe',
    padding: 12
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  analysisTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 10
  },
  typeBadge: {
    padding: 4,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 80,
    backgroundColor: '#dbeafe',
    color: '#1e40af'
  },
  analysisDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap'
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 4,
    minWidth: '30%'
  },
  detailLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
    marginRight: 4
  },
  detailValue: {
    fontSize: 8,
    color: '#374151'
  },
  measurementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '1 solid #e2e8f0'
  },
  measurementItem: {
    alignItems: 'center'
  },
  measurementLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 2
  },
  measurementValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af'
  },
  analysisDescription: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    border: '1 solid #e5e7eb'
  },
  descriptionLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4
  },
  descriptionText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.3
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

  const getLocationText = (analysis: AnalysisData) => {
    const parts = []
    if (analysis.zoneName) parts.push(analysis.zoneName)
    if (analysis.depositName) parts.push(analysis.depositName)
    return parts.length > 0 ? parts.join(' - ') : 'No especificada'
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

        {/* Analysis Cards */}
        <View style={styles.analysesContainer}>
          {data.length === 0 ? (
            <View style={styles.analysisCard}>
              <Text style={styles.analysisTitle}>No se encontraron análisis</Text>
              <Text style={styles.detailValue}>
                No hay análisis que coincidan con los filtros seleccionados para el período{' '}
                {new Date(startDate).toLocaleDateString('es-ES')} -{' '}
                {new Date(endDate).toLocaleDateString('es-ES')}.
              </Text>
            </View>
          ) : (
            data.map((analysis) => (
              <View key={analysis.id} style={styles.analysisCard}>
                {/* Card Header */}
                <View style={styles.analysisHeader}>
                  <Text style={styles.analysisTitle}>Análisis</Text>
                  <Text style={styles.typeBadge}>
                    {getAnalysisTypeLabel(analysis.analysisType)}
                  </Text>
                </View>

                {/* Card Details */}
                <View style={styles.analysisDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Analista:</Text>
                    <Text style={styles.detailValue}>{analysis.analyst}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Fecha:</Text>
                    <Text style={styles.detailValue}>{formatDate(analysis.analyzedAt)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Comunidad:</Text>
                    <Text style={styles.detailValue}>{analysis.communityName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Ubicación:</Text>
                    <Text style={styles.detailValue}>{getLocationText(analysis)}</Text>
                  </View>
                </View>

                {/* Measurements Section */}
                {(analysis.ph || analysis.chlorine || analysis.turbidity) && (
                  <View style={styles.measurementsContainer}>
                    {analysis.ph && (
                      <View style={styles.measurementItem}>
                        <Text style={styles.measurementLabel}>pH</Text>
                        <Text style={styles.measurementValue}>{analysis.ph}</Text>
                      </View>
                    )}
                    {analysis.chlorine && (
                      <View style={styles.measurementItem}>
                        <Text style={styles.measurementLabel}>Cloro</Text>
                        <Text style={styles.measurementValue}>{analysis.chlorine}</Text>
                      </View>
                    )}
                    {analysis.turbidity && (
                      <View style={styles.measurementItem}>
                        <Text style={styles.measurementLabel}>Turbidez</Text>
                        <Text style={styles.measurementValue}>{analysis.turbidity}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Description Section */}
                {analysis.description && (
                  <View style={styles.analysisDescription}>
                    <Text style={styles.descriptionLabel}>Descripción:</Text>
                    <Text style={styles.descriptionText}>{analysis.description}</Text>
                  </View>
                )}
              </View>
            ))
          )}
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

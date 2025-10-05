import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

interface IncidentData {
  id: string
  title: string
  reporterName: string
  status: string
  startAt: string | Date
  endAt?: string | Date
  description?: string
  closingDescription?: string
  communityName?: string
  zoneName?: string
  depositName?: string
  pointName?: string
}

interface IncidentsPDFProps {
  data: IncidentData[]
  startDate: string
  endDate: string
  status: 'all' | 'open' | 'closed'
  generatedAt: string
}

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
    borderBottom: '2 solid #dc2626',
    paddingBottom: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
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
    backgroundColor: '#fef2f2',
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
  incidentsContainer: {
    marginTop: 10
  },
  incidentCard: {
    border: '1 solid #fecaca',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fefefe',
    padding: 12
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  incidentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 10
  },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 60
  },
  statusOpen: {
    backgroundColor: '#fef3c7',
    color: '#92400e'
  },
  statusClosed: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  incidentDetails: {
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
  incidentDescription: {
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
    borderTop: '1 solid #fecaca',
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

const getStatusStyle = (status: string) => {
  return status === 'open' ? styles.statusOpen : styles.statusClosed
}

const getStatusText = (status: string) => {
  return status === 'open' ? 'Abierta' : 'Cerrada'
}

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getLocationText = (incident: IncidentData) => {
  const parts = []
  if (incident.zoneName) parts.push(incident.zoneName)
  if (incident.depositName) parts.push(incident.depositName)
  if (incident.pointName) parts.push(incident.pointName)
  return parts.length > 0 ? parts.join(' - ') : 'No especificada'
}

export function IncidentsPDF({ data, startDate, endDate, status, generatedAt }: IncidentsPDFProps) {
  const openCount = data.filter((incident) => incident.status === 'open').length
  const closedCount = data.filter((incident) => incident.status === 'closed').length
  const totalCount = data.length

  // Debug log
  console.log('IncidentsPDF - Data received:', data)
  console.log('IncidentsPDF - Total count:', totalCount)

  const getStatusFilterText = () => {
    switch (status) {
      case 'open':
        return 'Solo incidencias abiertas'
      case 'closed':
        return 'Solo incidencias cerradas'
      default:
        return 'Todas las incidencias'
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Incidencias</Text>
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
            <Text style={styles.summaryLabel}>Filtro de Estado:</Text>
            <Text style={styles.summaryValue}>{getStatusFilterText()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Incidencias:</Text>
            <Text style={styles.summaryValue}>{totalCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Incidencias Abiertas:</Text>
            <Text style={styles.summaryValue}>{openCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Incidencias Cerradas:</Text>
            <Text style={styles.summaryValue}>{closedCount}</Text>
          </View>
        </View>

        {/* Incidents Cards */}
        <View style={styles.incidentsContainer}>
          {data.length === 0 ? (
            <View style={styles.incidentCard}>
              <Text style={styles.incidentTitle}>No se encontraron incidencias</Text>
              <Text style={styles.detailValue}>
                No hay incidencias que coincidan con los filtros seleccionados para el período{' '}
                {formatDate(startDate)} - {formatDate(endDate)}.
              </Text>
            </View>
          ) : (
            data.map((incident) => (
              <View key={incident.id} style={styles.incidentCard}>
                {/* Card Header */}
                <View style={styles.incidentHeader}>
                  <Text style={styles.incidentTitle}>{incident.title}</Text>
                  <Text style={[styles.statusBadge, getStatusStyle(incident.status)]}>
                    {getStatusText(incident.status)}
                  </Text>
                </View>

                {/* Card Details */}
                <View style={styles.incidentDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Reportero:</Text>
                    <Text style={styles.detailValue}>{incident.reporterName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Fecha Inicio:</Text>
                    <Text style={styles.detailValue}>{formatDate(incident.startAt)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Fecha Fin:</Text>
                    <Text style={styles.detailValue}>
                      {incident.endAt ? formatDate(incident.endAt) : 'Pendiente'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Ubicación:</Text>
                    <Text style={styles.detailValue}>{getLocationText(incident)}</Text>
                  </View>
                </View>

                {/* Description Section */}
                {incident.description && (
                  <View style={styles.incidentDescription}>
                    <Text style={styles.descriptionLabel}>Descripción:</Text>
                    <Text style={styles.descriptionText}>{incident.description}</Text>
                  </View>
                )}

                {/* Closing Description Section */}
                {incident.closingDescription && (
                  <View style={styles.incidentDescription}>
                    <Text style={styles.descriptionLabel}>Descripción de Cierre:</Text>
                    <Text style={styles.descriptionText}>{incident.closingDescription}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Sistema de Gestión de Agua - Reporte de Incidencias</Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}

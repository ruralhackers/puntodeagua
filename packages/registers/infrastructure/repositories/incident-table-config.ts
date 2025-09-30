import type { TableConfig } from '@pda/common/domain'
import type { Incident } from '../../domain/entities/incident'

export const incidentTableConfig: TableConfig<Incident> = {
  model: 'incident',
  columns: [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      searchable: true
    },
    {
      key: 'reporterName',
      label: 'Reporter',
      sortable: true,
      searchable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      searchable: false
    },
    {
      key: 'startAt',
      label: 'Start Date',
      sortable: true,
      searchable: false
    },
    {
      key: 'endAt',
      label: 'End Date',
      sortable: true,
      searchable: false
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      searchable: true
    }
  ],
  defaultSort: {
    field: 'startAt',
    direction: 'desc'
  },
  searchFields: ['title', 'reporterName', 'description'],
  filters: [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' }
      ]
    }
  ]
}

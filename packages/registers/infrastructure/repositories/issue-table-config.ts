import type { TableConfig } from '@pda/common/domain'
import type { Issue } from '../../domain/entities/issue'

export const issueTableConfig: TableConfig<Issue> = {
  model: 'issue',
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

import type { TableConfig } from '@pda/common/domain'
import type { Provider } from '../../domain/entities/provider'

export const providerTableConfig: TableConfig<Provider> = {
  model: 'provider',
  columns: [
    {
      key: 'companyName',
      label: 'Company Name',
      sortable: true,
      searchable: true
    },
    {
      key: 'providerType',
      label: 'Type',
      sortable: true,
      searchable: true
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
      sortable: true,
      searchable: true
    },
    {
      key: 'contactPhone',
      label: 'Phone',
      sortable: false,
      searchable: true
    },
    {
      key: 'isActive',
      label: 'Active',
      sortable: true,
      searchable: false
    }
  ],
  defaultSort: {
    field: 'companyName',
    direction: 'asc'
  },
  searchFields: ['companyName', 'contactPerson', 'contactPhone', 'contactEmail'],
  filters: [
    {
      key: 'providerType',
      label: 'Provider Type',
      type: 'select',
      options: [
        { value: 'plumbing', label: 'Plumbing' },
        { value: 'electricity', label: 'Electricity' },
        { value: 'analysis', label: 'Analysis' },
        { value: 'masonry', label: 'Masonry' }
      ]
    },
    {
      key: 'isActive',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ]
}

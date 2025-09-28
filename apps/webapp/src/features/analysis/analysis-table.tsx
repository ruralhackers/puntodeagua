'use client'
import type { SearchParams } from 'nuqs/server'
import { ANALYSIS_TYPE_OPTIONS } from '@/constants/analysis-types'
import Table from '@/features/tables/table'
import { IdCopy } from '../../components/id-copy'

export default function AnalysisTable(searchParams: SearchParams) {
  return (
    <Table
      title="Analysis"
      description="Manage water quality analysis records"
      model="analysis"
      searchParams={searchParams}
      searchFields={['id', 'analyst', 'description']}
      orderBy={{ field: 'analyzedAt', direction: 'desc' }}
      includeFields={[]}
      filters={[
        {
          filterKey: 'analysisType',
          title: 'Analysis Type',
          options: ANALYSIS_TYPE_OPTIONS.map((option) => ({
            value: option.value,
            label: `${option.icon} ${option.label}`
          }))
        }
      ]}
      columns={[
        {
          accessorKey: 'id',
          header: 'ID',
          cell: ({ row }) => {
            const id = row.getValue('id') as string
            return <IdCopy id={id} />
          }
        },
        {
          accessorKey: 'analysisType',
          header: 'Type',
          cell: ({ row }) => {
            const type = row.getValue('analysisType') as string
            const typeOption = ANALYSIS_TYPE_OPTIONS.find((opt) => opt.value === type)
            return (
              <div className="flex items-center gap-2">
                <span>{typeOption?.icon}</span>
                <span>{typeOption?.label || type}</span>
              </div>
            )
          }
        },
        {
          accessorKey: 'analyst',
          header: 'Analyst'
        },
        {
          accessorKey: 'analyzedAt',
          header: 'Date',
          cell: ({ row }) => {
            const date = row.getValue('analyzedAt') as string
            return new Date(date).toLocaleDateString()
          }
        },
        {
          accessorKey: 'communityId',
          header: 'Community',
          cell: ({ row }) => {
            const communityId = row.getValue('communityId') as string | null
            if (!communityId) return 'N/A'
            return communityId.length > 8
              ? `${communityId.substring(0, 4)}...${communityId.slice(-4)}`
              : communityId
          }
        },
        {
          accessorKey: 'waterZoneId',
          header: 'Water Zone',
          cell: ({ row }) => {
            const waterZoneId = row.getValue('waterZoneId') as string | null
            if (!waterZoneId) return '-'
            return waterZoneId.length > 8
              ? `${waterZoneId.substring(0, 4)}...${waterZoneId.slice(-4)}`
              : waterZoneId
          }
        },
        {
          accessorKey: 'waterDepositId',
          header: 'Water Deposit',
          cell: ({ row }) => {
            const waterDepositId = row.getValue('waterDepositId') as string | null
            if (!waterDepositId) return '-'
            return waterDepositId.length > 8
              ? `${waterDepositId.substring(0, 4)}...${waterDepositId.slice(-4)}`
              : waterDepositId
          }
        },
        {
          accessorKey: 'ph',
          header: 'pH',
          cell: ({ row }) => {
            const ph = row.getValue('ph') as number | null
            return ph ? ph.toFixed(2) : '-'
          }
        },
        {
          accessorKey: 'turbidity',
          header: 'Turbidity',
          cell: ({ row }) => {
            const turbidity = row.getValue('turbidity') as number | null
            return turbidity ? `${turbidity.toFixed(2)} NTU` : '-'
          }
        },
        {
          accessorKey: 'chlorine',
          header: 'Chlorine',
          cell: ({ row }) => {
            const chlorine = row.getValue('chlorine') as number | null
            return chlorine ? `${chlorine.toFixed(2)} mg/L` : '-'
          }
        },
        {
          accessorKey: 'description',
          header: 'Description',
          cell: ({ row }) => {
            const description = row.getValue('description') as string | null
            if (!description) return '-'
            return description.length > 50 ? `${description.substring(0, 50)}...` : description
          }
        }
      ]}
    />
  )
}

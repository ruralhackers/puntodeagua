import type { TableFieldConfig, TableQueryConfig, TableRelationConfig } from './TableQueryConfig'

interface AutoTableOptions<TEntity> {
  entityFromDto?: (dto: Record<string, unknown>) => TEntity
  databaseType: 'prisma' | 'mongo'
  modelName?: string
  collectionName?: string
  defaultSort?: { field: string; direction: 'asc' | 'desc' }
  fieldOverrides?: Record<string, Partial<TableFieldConfig>>
  relations?: string[]
  useSearchIndex?: boolean
  searchIndexName?: string
}

function generateFieldsWithDefaults(
  fieldOverrides: Record<string, Partial<TableFieldConfig>>
): Record<string, TableFieldConfig> {
  const fields: Record<string, TableFieldConfig> = {}

  // Apply overrides
  Object.entries(fieldOverrides).forEach(([fieldName, override]) => {
    fields[fieldName] = {
      field: fieldName,
      searchType: 'equals',
      atlasSearchMode: 'phrase',
      ...override
    }
  })

  return fields
}

function generateRelationsConfig(relations: string[]): Record<string, TableRelationConfig> {
  return relations.reduce(
    (acc, relationName) => {
      acc[relationName] = {
        relation: relationName,
        include: true // Include relations by default when explicitly configured
      }
      return acc
    },
    {} as Record<string, TableRelationConfig>
  )
}

export function createAutoTableConfig<TEntity>(options: AutoTableOptions<TEntity>): Omit<
  TableQueryConfig<TEntity, TEntity>,
  'entityFromDto'
> & {
  entityFromDto?: (dto: Record<string, unknown>) => TEntity
} {
  return {
    entityFromDto: options.entityFromDto,
    databaseType: options.databaseType,
    modelName: options.modelName,
    collectionName: options.collectionName,
    defaultSort: options.defaultSort || { field: 'id', direction: 'asc' },
    fields: generateFieldsWithDefaults(options.fieldOverrides || {}),
    relations: generateRelationsConfig(options.relations || []),
    useSearchIndex: options.useSearchIndex,
    searchIndexName: options.searchIndexName
  }
}

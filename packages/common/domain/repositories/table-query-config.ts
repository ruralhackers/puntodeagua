export interface TableFieldConfig {
  /** Field name */
  field: string
  /** Search type for this field */
  searchType?: 'contains' | 'equals' | 'regex'
  /** Atlas Search operator preference for this field when using useSearchIndex */
  atlasSearchMode?: 'text' | 'phrase'
  /** Custom search logic for this field */
  customSearch?: (searchTerm: string, dbType: 'prisma' | 'mongo') => Record<string, unknown>
  /** Custom sort logic for this field */
  customSort?: (direction: 'asc' | 'desc', dbType: 'prisma' | 'mongo') => Record<string, unknown>
}

export interface TableRelationConfig {
  /** Relation name */
  relation: string
  /** Whether to include by default */
  include?: boolean
  /** Nested relations to include */
  nested?: TableRelationConfig[]
}

export interface TableQueryConfig<TEntity, _TDto = unknown> {
  /** Entity constructor/factory function */
  entityFromDto?: (dto: Record<string, unknown>) => TEntity
  /** Default sort field and direction */
  defaultSort: { field: string; direction: 'asc' | 'desc' }
  /** Field configurations */
  fields: Record<string, TableFieldConfig>
  /** Relation configurations */
  relations?: Record<string, TableRelationConfig>
  /** Database type */
  databaseType: 'prisma' | 'mongo'
  /** Model name for Prisma */
  modelName?: string
  /** Collection name for MongoDB */
  collectionName?: string
  /** If true, MongoTableQueryBuilder will use Atlas Search ($search) instead of classic find for searchTerm+searchFields */
  useSearchIndex?: boolean
  /** Atlas Search index name (defaults to 'default') */
  searchIndexName?: string
}

export interface TableQueryBuilderContext {
  searchTerm?: string
  searchFields?: string[]
  filters?: Array<{ field: string; value: unknown; operator?: string }>
  orderBy?: { field: string; direction: 'asc' | 'desc' }
  include?: string[]
  page: number
  limit: number
  selector?: Record<string, unknown>
}

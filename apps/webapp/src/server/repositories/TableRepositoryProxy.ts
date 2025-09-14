import type { TableQueryParams, TableQueryPort, TableQueryResult } from '@pda/common/domain'

import { UserFactory } from '@pda/users'

/**
 * Interface for the proxy that accepts model as first parameter
 */
export interface TableRepositoryProxyPort {
  findForTable(model: string, params: TableQueryParams): Promise<TableQueryResult<unknown>>
}

/**
 * TableRepositoryProxy - Delegates table queries to appropriate domain repositories
 *
 * Follows the same pattern as BlockchainProviderProxy:
 * - Single entry point for all table operations
 * - Delegates to domain-specific repositories based on model
 * - Maintains type safety while allowing dynamic model access
 *
 * Usage:
 *   const proxy = new TableRepositoryProxy()
 *   const result = await proxy.findForTable('user', params)
 */
export class TableRepositoryProxy implements TableRepositoryProxyPort {
  /**
   * Main entry point for table queries (returns DTOs)
   * Delegates to appropriate repository based on model name
   */
  async findForTable(model: string, params: TableQueryParams): Promise<TableQueryResult<unknown>> {
    const repository = this.proxy(model)
    return repository.findForTable(params)
  }

  /**
   * Private proxy method that routes to correct repository
   * Similar to BlockchainProviderProxy.proxy()
   */
  private proxy(model: string): TableQueryPort<unknown, unknown> {
    if (model === 'user') {
      return UserFactory.userPrismaRepository()
    }

    // Unknown model
    throw new Error(`TableRepositoryProxy: Unsupported model: ${model}`)
  }
}

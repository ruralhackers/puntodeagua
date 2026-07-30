import type { TableQueryParams, TableQueryPort, TableQueryResult } from '@pda/common/domain'
import { CommunityFactory } from '@pda/community'
import { RegistersFactory } from '@pda/registers'
import { UserFactory } from '@pda/user'
import type { CommunityScope } from '@/server/api/trpc'

/**
 * Delegates table queries to the right domain repository, always scoped to the
 * caller's communities. Each supported model declares how it is anchored to a
 * community; a model with no declared anchor cannot be queried at all.
 */
export class TableRepositoryProxy {
  async findForTable(
    model: string,
    params: TableQueryParams,
    scope: CommunityScope
  ): Promise<TableQueryResult<unknown>> {
    const repository = this.repositoryFor(model)
    const scoped: TableQueryParams = {
      ...params,
      // A global admin (ADMIN role) gets no community filter; everyone else is
      // pinned to their own community.
      selector:
        scope.kind === 'global' ? undefined : this.communityScopeFor(model, scope.communityId)
    }
    return repository.findForTable(scoped)
  }

  private repositoryFor(model: string): TableQueryPort<unknown, unknown> {
    if (model === 'user') {
      return UserFactory.userPrismaRepository()
    }

    if (model === 'community') {
      return CommunityFactory.communityPrismaRepository()
    }

    if (model === 'waterPoint') {
      return CommunityFactory.waterPointPrismaRepository()
    }

    if (model === 'analysis') {
      return RegistersFactory.analysisPrismaRepository()
    }

    throw new Error(`TableRepositoryProxy: unsupported model: ${model}`)
  }

  // How each model is reachable from a community. This is the only place that
  // knows it, and adding a model without adding its anchor is a hard error
  // rather than a silent hole.
  private communityScopeFor(model: string, communityId: string): Record<string, unknown> {
    if (model === 'user') {
      return { communityId }
    }

    if (model === 'community') {
      return { id: communityId }
    }

    if (model === 'waterPoint') {
      return { communityZone: { communityId } }
    }

    if (model === 'analysis') {
      return { communityId }
    }

    throw new Error(`TableRepositoryProxy: no community scope defined for model: ${model}`)
  }
}

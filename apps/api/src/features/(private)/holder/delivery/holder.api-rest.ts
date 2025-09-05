import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { getHoldersFiltersSchema } from 'features'
import { apiContainer } from '../../../../api.container'
import { GetHolderQry } from '../application/get-holder.qry'
import { GetHoldersQry } from '../application/get-holders.qry'

export const holderApiRest = new Elysia()
  .get('/holders', async ({ query, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    // Parse and validate query parameters
    const filters = getHoldersFiltersSchema.parse(query)

    // Add community filter for non-super-admin users
    if (!user || 'error' in user) {
      throw new Error('Authentication required')
    }

    // Type assertion after the guard
    const authenticatedUser = user as {
      userId: string
      email: string
      roles: string[]
      communityId: string | null
    }

    if (authenticatedUser.communityId && !authenticatedUser.roles.includes('SUPER_ADMIN')) {
      filters.communityId = authenticatedUser.communityId
    }

    const holders = await useCaseService.execute(GetHoldersQry, filters)
    return holders.map((x) => x.toDto())
  })
  .get('/holders/:id', async ({ params, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    if (!user || 'error' in user) {
      throw new Error('Authentication required')
    }

    // Type assertion after the guard
    const authenticatedUser = user as {
      userId: string
      email: string
      roles: string[]
      communityId: string | null
    }

    const holder = await useCaseService.execute(GetHolderQry, {
      id: params.id,
      communityId:
        authenticatedUser.communityId && !authenticatedUser.roles.includes('SUPER_ADMIN')
          ? authenticatedUser.communityId
          : undefined
    })

    if (!holder) {
      return { error: 'Holder not found' }
    }

    return holder.toDto()
  })

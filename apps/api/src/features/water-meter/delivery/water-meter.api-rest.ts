import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { getWaterMetersFiltersSchema } from 'features'
import { apiContainer } from '../../../api.container'
import { GetWaterMeterQry } from '../application/get-water-meter.qry'
import { GetWaterMetersQry } from '../application/get-water-meters.qry'
import { UpdateWaterMeterCmd } from '../application/update-water-meter.cmd'

interface UpdateWaterMeterBody {
  name: string
  measurementUnit: string
  waterZoneId?: string
  images?: string[]
}

interface AuthenticatedUser {
  userId: string
  email: string
  roles: string[]
  communityId: string | null
}

export const waterMeterApiRest = new Elysia()
  .get('/water-meters', async ({ query, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    // Parse and validate query parameters
    const filters = getWaterMetersFiltersSchema.parse(query)

    // Add community filter for non-super-admin users
    if (!user || 'error' in user) {
      throw new Error('Authentication required')
    }

    const authenticatedUser = user as AuthenticatedUser
    if (authenticatedUser.communityId && !authenticatedUser.roles.includes('SUPER_ADMIN')) {
      filters.communityId = authenticatedUser.communityId
    }

    const waterMeters = await useCaseService.execute(GetWaterMetersQry, filters)
    return waterMeters.map((x) => x.toDto())
  })
  .get('/water-meter/:id', async ({ params, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    if (!user || 'error' in user) {
      throw new Error('Authentication required')
    }

    const authenticatedUser = user as AuthenticatedUser
    const queryParams = {
      id: params.id,
      communityId:
        authenticatedUser.communityId && !authenticatedUser.roles.includes('SUPER_ADMIN')
          ? authenticatedUser.communityId
          : undefined
    }

    const waterMeter = await useCaseService.execute(GetWaterMeterQry, queryParams)
    return waterMeter?.toDto() ?? null
  })
  .put('/water-meter/:id', async ({ params, body, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    if (!user || 'error' in user) {
      throw new Error('Authentication required')
    }

    const authUser = user as {
      userId: string
      email: string
      roles: string[]
      communityId: string | null
    }
    // Validate that the user has access to this water meter
    const queryParams = {
      id: params.id,
      communityId:
        authUser.communityId && !authUser.roles.includes('SUPER_ADMIN')
          ? authUser.communityId
          : undefined
    }

    const existingWaterMeter = await useCaseService.execute(GetWaterMeterQry, queryParams)
    if (!existingWaterMeter) {
      throw new Error('Water meter not found or access denied')
    }

    // Prepare update command
    const updateCommand = {
      id: params.id,
      name: (body as UpdateWaterMeterBody).name,
      measurementUnit: (body as UpdateWaterMeterBody).measurementUnit,
      waterZoneId: (body as UpdateWaterMeterBody).waterZoneId,
      images: (body as UpdateWaterMeterBody).images
    }

    await useCaseService.execute(UpdateWaterMeterCmd, updateCommand)

    // Return updated water meter
    const updatedWaterMeter = await useCaseService.execute(GetWaterMeterQry, queryParams)
    return updatedWaterMeter?.toDto() ?? null
  })

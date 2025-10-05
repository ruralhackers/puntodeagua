import { Id } from '@pda/common/domain'
import { RegistersFactory } from '@pda/registers'
import { Incident } from '@pda/registers/domain/entities/incident'
import { incidentSchema } from '@pda/registers/domain/entities/incident.dto'
import { z } from 'zod'
import { handleDomainError } from '@/server/api/error-handler'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const incidentsRouter = createTRPCRouter({
  getIncidents: protectedProcedure.query(async () => {
    const repo = RegistersFactory.incidentPrismaRepository()
    const incidents = await repo.findAll()
    return incidents.map((incident) => incident.toDto())
  }),

  getIncidentsByCommunityId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = RegistersFactory.incidentPrismaRepository()
      const incidents = await repo.findByCommunityId(Id.fromString(input.id))
      return incidents.map((incident) => incident.toDto())
    }),

  getIncidentById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = RegistersFactory.incidentPrismaRepository()
      const incident = await repo.findById(Id.fromString(input.id))
      return incident?.toDto()
    }),

  addIncident: protectedProcedure
    .input(incidentSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      try {
        const service = RegistersFactory.incidentCreatorService()

        const incident = Incident.create({
          title: input.title,
          reporterName: input.reporterName,
          startAt: input.startAt,
          communityId: input.communityId,
          communityZoneId: input.communityZoneId,
          waterDepositId: input.waterDepositId,
          waterPointId: input.waterPointId,
          description: input.description,
          endAt: input.endAt,
          status: 'open'
        })

        const savedIncident = await service.run({ incident })
        return savedIncident.toDto()
      } catch (error) {
        // Handle domain errors with Spanish messages
        handleDomainError(error)
      }
    }),

  updateIncident: protectedProcedure.input(incidentSchema).mutation(async ({ input }) => {
    try {
      const service = RegistersFactory.incidentUpdaterService()

      const savedIncident = await service.run({
        id: Id.fromString(input.id),
        updatedIncidentData: {
          status: input.status,
          endAt: input.endAt,
          closingDescription: input.closingDescription
        }
      })
      return savedIncident.toDto()
    } catch (error) {
      handleDomainError(error)
    }
  }),

  deleteIncident: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const repo = RegistersFactory.incidentPrismaRepository()
      await repo.delete(Id.fromString(input.id))
      return { success: true }
    }),

  exportIncidents: protectedProcedure
    .input(
      z.object({
        startDate: z.string().transform((str) => new Date(str)),
        endDate: z.string().transform((str) => new Date(str)),
        status: z.enum(['open', 'closed', 'all']).optional().default('all'),
        communityId: z.string().optional()
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const repo = RegistersFactory.incidentPrismaRepository()

        // Si no se proporciona communityId, usar la del usuario autenticado
        const communityId = input.communityId
          ? Id.fromString(input.communityId)
          : ctx.session?.user?.community?.id
            ? Id.fromString(ctx.session.user.community.id)
            : undefined

        if (!communityId) {
          throw new Error('No se pudo determinar la comunidad para la exportación')
        }

        const filters: {
          communityId: Id
          startDate?: Date
          endDate?: Date
          status?: 'open' | 'closed'
        } = {
          communityId,
          startDate: input.startDate,
          endDate: input.endDate
        }

        // Only add status filter if not 'all'
        if (input.status !== 'all') {
          filters.status = input.status
        }

        const incidents = await repo.findByFilters(filters)

        return incidents.map((incident) => incident.toDto())
      } catch (error) {
        handleDomainError(error)
      }
    })
})

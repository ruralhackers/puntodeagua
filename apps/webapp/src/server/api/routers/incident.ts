import { Id } from '@pda/common/domain'
import { RegistersFactory } from '@pda/registers'
import { Incident } from '@pda/registers/domain/entities/incident'
import { incidentSchema } from '@pda/registers/domain/entities/incident.dto'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
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
        if (error && typeof error === 'object' && 'defaultMessageEs' in error) {
          const domainError = error as { defaultMessageEs: string; statusCode?: number }
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: domainError.defaultMessageEs
          })
        }
        throw error
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
      // Handle domain errors with Spanish messages
      if (error && typeof error === 'object' && 'defaultMessageEs' in error) {
        const domainError = error as { defaultMessageEs: string; statusCode?: number }
        const errorCode = domainError.statusCode === 404 ? 'NOT_FOUND' : 'BAD_REQUEST'
        throw new TRPCError({
          code: errorCode,
          message: domainError.defaultMessageEs
        })
      }
      throw error
    }
  }),

  deleteIncident: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const repo = RegistersFactory.incidentPrismaRepository()
      await repo.delete(Id.fromString(input.id))
      return { success: true }
    })
})

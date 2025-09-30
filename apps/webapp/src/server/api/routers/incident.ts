import { Id } from '@pda/common/domain'
import { RegistersFactory } from '@pda/registers'
import { Incident } from '@pda/registers/domain/entities/incident'
import { incidentSchema } from '@pda/registers/domain/entities/incident.dto'
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
      const service = RegistersFactory.incidentCreatorService()

      const incident = Incident.create({
        title: input.title,
        reporterName: input.reporterName,
        startAt: input.startAt,
        communityId: input.communityId,
        waterZoneId: input.waterZoneId,
        waterDepositId: input.waterDepositId,
        waterPointId: input.waterPointId,
        description: input.description,
        endAt: input.endAt,
        status: 'open'
      })

      const savedIncident = await service.run({ incident })
      return savedIncident.toDto()
    }),

  updateIncident: protectedProcedure.input(incidentSchema).mutation(async ({ input }) => {
    const service = RegistersFactory.incidentUpdaterService()

    // we receive id and fields to update
    // then, so service does checks, finds the incident, and updates the fields
    // we create a incidentUpdateSchema that is the same as incidentSchema, but with the fields to update

    const updatedIncident = Incident.fromDto({
      id: input.id,
      title: input.title,
      reporterName: input.reporterName,
      startAt: input.startAt,
      communityId: input.communityId,
      waterZoneId: input.waterZoneId,
      waterDepositId: input.waterDepositId,
      waterPointId: input.waterPointId,
      description: input.description,
      status: input.status,
      endAt: input.endAt
    })

    const savedIncident = await service.run({
      id: Id.fromString(input.id),
      updatedIncident
    })
    return savedIncident.toDto()
  }),

  deleteIncident: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const repo = RegistersFactory.incidentPrismaRepository()
      await repo.delete(Id.fromString(input.id))
      return { success: true }
    })
})

import { Id } from '@pda/common/domain'
import { Analysis, AnalysisType, RegistersFactory } from '@pda/registers'
import { analysisSchema } from '@pda/registers/domain/entities/analysis.dto'
import { z } from 'zod'
import { handleDomainError } from '@/server/api/error-handler'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const registersRouter = createTRPCRouter({
  getAnalyses: protectedProcedure.query(async () => {
    const repo = RegistersFactory.analysisPrismaRepository()
    const analyses = await repo.findAll()
    return analyses.map((analysis) => analysis.toDto())
  }),

  getAnalysesByCommunityId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = RegistersFactory.analysisPrismaRepository()
      const analyses = await repo.findByCommunityId(Id.fromString(input.id))
      return analyses.map((analysis) => analysis.toDto())
    }),

  getAnalysisById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = RegistersFactory.analysisPrismaRepository()
      const analysis = await repo.findById(Id.fromString(input.id))
      return analysis?.toDto()
    }),

  addAnalysis: protectedProcedure
    .input(analysisSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      try {
        const service = RegistersFactory.analysisCreatorService()

        const params = {
          communityId: input.communityId,
          analysisType: input.analysisType,
          analyst: input.analyst,
          analyzedAt: input.analyzedAt,
          communityZoneId: input.communityZoneId,
          waterDepositId: input.waterDepositId,
          ph: input.ph,
          turbidity: input.turbidity,
          chlorine: input.chlorine,
          description: input.description ?? undefined
        }

        const analysis = Analysis.create(params)

        await service.run({ analysis })
        return analysis.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    }),

  exportAnalyses: protectedProcedure
    .input(
      z.object({
        analysisTypes: z.array(z.enum(AnalysisType.values() as [string, ...string[]])),
        startDate: z.date(),
        endDate: z.date(),
        communityId: z.string().optional()
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const repo = RegistersFactory.analysisPrismaRepository()

        // Si no se proporciona communityId, usar la del usuario autenticado
        const communityId = input.communityId
          ? Id.fromString(input.communityId)
          : ctx.session?.user?.community?.id
            ? Id.fromString(ctx.session.user.community.id)
            : undefined

        if (!communityId) {
          throw new Error('No se pudo determinar la comunidad para la exportación')
        }

        const analyses = await repo.findByFilters({
          communityId,
          analysisTypes: input.analysisTypes,
          startDate: input.startDate,
          endDate: input.endDate
        })

        return analyses
      } catch (error) {
        handleDomainError(error)
      }
    })
})

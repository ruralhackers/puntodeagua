import { Id } from '@pda/common/domain'
import { Analysis, RegistersFactory } from '@pda/registers'
import { analysisSchema } from '@pda/registers/domain/entities/analysis.dto'
import { z } from 'zod'
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
      const service = RegistersFactory.analysisCreatorService()

      const params = {
        communityId: input.communityId,
        analysisType: input.analysisType,
        analyst: input.analyst,
        analyzedAt: input.analyzedAt,
        waterZoneId: input.waterZoneId,
        waterDepositId: input.waterDepositId,
        ph: input.ph,
        turbidity: input.turbidity,
        chlorine: input.chlorine,
        description: input.description ?? undefined
      }

      const analysis = Analysis.create(params)

      await service.run({ analysis })
      return analysis.toDto()
    })
})

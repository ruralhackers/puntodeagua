import { Id } from '@pda/common/domain'
import {
  Analysis,
  AnalysisCommunityNotDeterminedError,
  AnalysisType,
  RegistersFactory
} from '@pda/registers'
import { analysisSchema } from '@pda/registers/domain/entities/analysis.dto'
import { z } from 'zod'
import { handleDomainError } from '@/server/api/error-handler'
import { assertCommunityInScope } from '@/server/api/guards/community-scope.guards'
import { communityScopedProcedure, createTRPCRouter, requireCommunityId } from '@/server/api/trpc'

export const registersRouter = createTRPCRouter({
  // getAnalyses removed: it returned every community's analyses with no scope,
  // and no screen called it.

  getAnalysesByCommunityId: communityScopedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      assertCommunityInScope(input.id, ctx.scope)

      const repo = RegistersFactory.analysisPrismaRepository()
      const analyses = await repo.findByCommunityId(Id.fromString(input.id))
      return analyses.map((analysis) => analysis.toDto())
    }),

  // getAnalysisById removed: unscoped and called by no screen.

  addAnalysis: communityScopedProcedure
    .input(analysisSchema.omit({ id: true }))
    .mutation(async ({ input, ctx }) => {
      assertCommunityInScope(input.communityId, ctx.scope)

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

  exportAnalyses: communityScopedProcedure
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
        if (input.communityId) {
          assertCommunityInScope(input.communityId, ctx.scope)
        }
        if (ctx.scope.kind === 'global' && !input.communityId) {
          throw new AnalysisCommunityNotDeterminedError()
        }
        const communityId = Id.fromString(requireCommunityId(ctx.scope, input.communityId))

        const analyses = await repo.findByFilters({
          communityId,
          analysisTypes: input.analysisTypes,
          startDate: input.startDate,
          endDate: input.endDate
        })

        return analyses.map((analysis) => analysis.toDto())
      } catch (error) {
        handleDomainError(error)
      }
    })
})

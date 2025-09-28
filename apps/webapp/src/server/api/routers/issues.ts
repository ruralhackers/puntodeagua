import { Id } from '@pda/common/domain'
import { RegistersFactory } from '@pda/registers'
import { Issue } from '@pda/registers/domain/entities/issue'
import { issueSchema } from '@pda/registers/domain/entities/issue.dto'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const issuesRouter = createTRPCRouter({
  getIssues: protectedProcedure.query(async () => {
    const repo = RegistersFactory.issuePrismaRepository()
    const issues = await repo.findAll()
    return issues.map((issue) => issue.toDto())
  }),

  getIssuesByCommunityId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = RegistersFactory.issuePrismaRepository()
      const issues = await repo.findByCommunityId(Id.fromString(input.id))
      return issues.map((issue) => issue.toDto())
    }),

  getIssueById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const repo = RegistersFactory.issuePrismaRepository()
    const issue = await repo.findById(Id.fromString(input.id))
    return issue?.toDto()
  }),

  addIssue: protectedProcedure.input(issueSchema.omit({ id: true })).mutation(async ({ input }) => {
    const service = RegistersFactory.issueCreatorService()

    const issue = Issue.create({
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

    const savedIssue = await service.run({ issue })
    return savedIssue.toDto()
  }),

  updateIssue: protectedProcedure.input(issueSchema).mutation(async ({ input }) => {
    const service = RegistersFactory.issueUpdaterService()

    const updatedIssue = Issue.fromDto({
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

    const savedIssue = await service.run({
      id: Id.fromString(input.id),
      updatedIssue
    })
    return savedIssue.toDto()
  }),

  deleteIssue: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const repo = RegistersFactory.issuePrismaRepository()
      await repo.delete(Id.fromString(input.id))
      return { success: true }
    })
})

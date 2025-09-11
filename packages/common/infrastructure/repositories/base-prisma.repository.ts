import type { PrismaClient, client as prisma } from '@ph/database'

export abstract class BasePrismaRepository {
  constructor(protected readonly db: typeof prisma) {}
  protected abstract readonly model: string
  protected abstract getModel(): PrismaClient[keyof PrismaClient]
}

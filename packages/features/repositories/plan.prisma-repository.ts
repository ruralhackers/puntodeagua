import type { PrismaClient} from '@sws/database'
import { BasePrismaRepository } from './base.prisma.repository';
import type { PlanRepository } from "./plan.repository";

export class PlanPrismaRepository extends BasePrismaRepository implements PlanRepository {

  protected readonly model = 'plan'
  protected getModel(): PrismaClient['plan'] {
    return this.db.plan
  }
}

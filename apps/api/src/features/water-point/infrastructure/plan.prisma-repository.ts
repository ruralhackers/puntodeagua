import type { Id } from "core";
import type { PrismaClient } from "database";
import { BasePrismaRepository, Plan, type PlanRepository } from "features";

export class PlanPrismaRepository extends BasePrismaRepository implements PlanRepository{
    protected readonly model = 'plan'
    protected getModel(): PrismaClient['plan'] {
        return this.db.plan
    }

    async save(input: Plan): Promise<void> {
        const data = {
            id: input.id.toString(),
            name: input.name,
        };

        await this.getModel().upsert({
            where: { id: input.id.toString() },
            create: {
                ...data
            },
            update: {
              name: data.name,
             },
        });
    }

    async findById(id: Id): Promise<Plan | undefined> {
      const plan = await this.getModel().findUnique({ where: { id:id.toString() } });
      return plan ? Plan.create(plan) : undefined;
    }

    async findAll(): Promise<Plan[]> {
      const plans = await this.getModel().findMany()
      return plans.map(p => Plan.create(p))
    }

    async delete(id: Id): Promise<void> {
        await this.getModel().delete({ where: { id: id.toString() } });
    }
}
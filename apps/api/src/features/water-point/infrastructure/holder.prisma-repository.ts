import type { Id } from "core";
import type { PrismaClient } from "database";
import { BasePrismaRepository, Holder, type HolderRepository } from "features";

export class HolderPrismaRepository extends BasePrismaRepository implements HolderRepository{
    protected readonly model = 'holder'
    protected getModel(): PrismaClient['holder'] {
        return this.db.holder
    }

    async save(input: Holder): Promise<void> {
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

    async findById(id: Id): Promise<Holder | undefined> {
      const holder = await this.getModel().findUnique({ where: { id:id.toString() } });
      return holder ? Holder.create(holder) : undefined;
    }

    async findAll(): Promise<Holder[]> {
      const holders = await this.getModel().findMany()
      return holders.map(h => Holder.create(h))
    }

    async delete(id: Id): Promise<void> {
        await this.getModel().delete({ where: { id: id.toString() } });
    }
}
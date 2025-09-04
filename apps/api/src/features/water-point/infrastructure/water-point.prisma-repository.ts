import type { Id } from 'core'
import type { PrismaClient } from 'database'
import { BasePrismaRepository, WaterPoint, type WaterPointRepository } from 'features'

export class WaterPointPrismaRepository
  extends BasePrismaRepository
  implements WaterPointRepository
{
  protected readonly model = 'waterPoint'
  protected getModel(): PrismaClient['waterPoint'] {
    return this.db.waterPoint
  }

  async findAll(): Promise<WaterPoint[]> {
    const waterPoints = await this.getModel().findMany()
    return waterPoints.map((waterPoint) =>
      WaterPoint.create({
        ...waterPoint,
        fixedPopulation: waterPoint.fixedPopulation ?? 0,
        floatingPopulation: waterPoint.floatingPopulation ?? 0
      })
    )
  }

  async findById(id: Id): Promise<WaterPoint | undefined> {
    const wp = await this.getModel().findUniqueOrThrow({ where: { id: id.toString() } })
    return wp
      ? WaterPoint.create({
          ...wp,
          fixedPopulation: wp.fixedPopulation ?? 0,
          floatingPopulation: wp.floatingPopulation ?? 0
        })
      : undefined
  }

  async save(waterPoint: WaterPoint): Promise<void> {
    const data = {
      id: waterPoint.id.toString(),
      communityId: waterPoint.communityId.toString(),
      name: waterPoint.name,
      location: waterPoint.location.toString(),
      description: waterPoint.description,
      fixedPopulation: waterPoint.fixedPopulation,
      floatingPopulation: waterPoint.floatingPopulation
    }

    await this.getModel().upsert({
      where: { id: waterPoint.id.toString() },
      create: {
        ...data
      },
      update: {
        name: data.name,
        location: data.location,
        description: data.description,
        fixedPopulation: data.fixedPopulation,
        floatingPopulation: data.floatingPopulation
      }
    })
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }
}

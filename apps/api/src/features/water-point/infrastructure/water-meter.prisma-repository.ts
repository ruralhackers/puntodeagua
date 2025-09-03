import type { Id } from 'core'
import type { PrismaClient } from 'database'
import { BasePrismaRepository, WaterMeter, type WaterMeterRepository } from 'features'

export class WaterMeterPrismaRepository
  extends BasePrismaRepository
  implements WaterMeterRepository
{
  protected readonly model = 'waterMeter'
  protected getModel(): PrismaClient['waterMeter'] {
    return this.db.waterMeter
  }

  async save(input: WaterMeter): Promise<void> {
    const data = {
        id: input.id.toString(),
        holderId: input.holderId.toString(),
        waterPointId: input.waterPointId.toString(),
        measurementUnit: input.measurementUnit.toString(),
        images: input.images,
    };

    await this.getModel().upsert({
        where: { id: input.id.toString() },
        create: {
            ...data
        },
        update: {
          measurementUnit: data.measurementUnit,
          images: data.images,
          },
    });
  }

  async findById(id: Id): Promise<WaterMeter | undefined> {
      const wm = await this.getModel().findUnique({ where: { id:id.toString() } });
      return wm ? WaterMeter.create(wm) : undefined;
  }

  async findAll(): Promise<WaterMeter[]> {
    const waterMeters = await this.getModel().findMany()
    return waterMeters.map(wm => WaterMeter.create(wm))
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }
}

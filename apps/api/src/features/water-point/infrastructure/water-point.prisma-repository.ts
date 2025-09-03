
import type { Id } from "core";
import type { PrismaClient } from "database";
import { BasePrismaRepository, WaterPoint, type WaterPointRepository, } from "features";

export class WaterPointPrismaRepository extends BasePrismaRepository implements WaterPointRepository{
    protected readonly model = 'waterPoint'
    protected getModel(): PrismaClient['waterPoint'] {
        return this.db.waterPoint
    }

    async findAll(): Promise<WaterPoint[]> {
        const waterPoints = await this.getModel().findMany();
        return waterPoints.map(waterPoint => WaterPoint.create(waterPoint))
    }

    async findById(id: Id): Promise<WaterPoint | undefined> {
        const wp = await this.getModel().findUniqueOrThrow({ where: { id:id.toString() } });
        return wp ? WaterPoint.create(wp) : undefined;
    }

    async save(waterPoint: WaterPoint): Promise<void> {
        const waterPointData = {
            id: waterPoint.id.toString(),
            communityId: waterPoint.communityId.toString(),
            name: waterPoint.name,
            location: waterPoint.location.toString(),
            description: waterPoint.description,
        };
        await this.getModel().upsert({
            where: { id: waterPoint.id.toString() },
            create: {
                ...waterPointData
            },
            update: { ...waterPointData },
        });
    }

    async delete(id: Id): Promise<void> {
        await this.getModel().delete({ where: { id:id.toString() } });
    }
}

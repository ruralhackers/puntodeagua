import type {WaterPointRepository} from "features";
import {Id} from "core";
import {WaterPoint} from "features/entities/water-point";
import {PrismaClient} from "database";

export class WaterPointPrismaRepository implements WaterPointRepository{
    constructor(private readonly prisma: PrismaClient) {}

    delete(id: Id): Promise<void> {
        return Promise.resolve(undefined);
    }

    async findAll(): Promise<WaterPoint[]> {
        const waterPoints = await this.prisma.waterPoint.findMany();
        return waterPoints.map(waterPoint => WaterPoint.create(waterPoint))
    }

    async findById(id: Id): Promise<WaterPoint | null> {
        return null
    }

    async save(waterPoint: WaterPoint): Promise<void> {
        return
    }
}

import { client } from "./client";

const prisma = client;

async function main() {
	const communityId = await seedPlanAndCommunity();
	await seedWaterPoints(communityId);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

async function seedPlanAndCommunity() {
	const plan = await prisma.plan.create({
		data: {
			name: "Aguas de Galicia",
		},
	});

	const COMMUNITY = {
		name: "Anceu",
		planId: plan.id,
	};

	const community = await prisma.community.create({
		data: COMMUNITY,
	});
	return community.id;
}

const WATER_POINTS = [
	{
		name: "Water Point 1",
		location: "42.359987,-8.4669443",
	},
	{
		name: "Water Point 2",
		location: "42.359987,-8.4669443",
	},
];

async function seedWaterPoints(communityId: string) {
	await prisma.waterPoint.deleteMany({});
	await prisma.waterPoint.createMany({
		data: WATER_POINTS.map((wp) => ({
			...wp,
			communityId,
		})),
	});
}

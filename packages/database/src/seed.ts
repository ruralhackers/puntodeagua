import { client } from "./client";
import bcrypt from "bcrypt";

const prisma = client;

async function main() {
	await seedAdmin();
	const communityId = await seedPlanAndCommunity();
	await seedWaterPoints(communityId);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await client.$disconnect();
	});

async function seedAdmin() {
	console.log("Creating admin user...");
	
	const hashedPassword = await bcrypt.hash("admin123", 10);
	
	const adminUser = await client.user.upsert({
		where: { email: "admin@puntodeagua.com" },
		update: {},
		create: {
			email: "admin@puntodeagua.com",
			name: "Administrador",
			password: hashedPassword,
			roles: ["admin"],
		},
	});
	
	console.log(`Created admin user: ${adminUser.email}`);
}

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
		location: "2.40,0.30",
	},
	{
		name: "Water Point 2",
		location: "1.40,0.35",
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

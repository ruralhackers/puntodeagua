import { client } from "./client";
import bcrypt from "bcrypt";

const prisma = client;

async function main() {
	await seedUsers();
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

async function seedUsers() {
	// Delete existing users first
	await prisma.user.deleteMany({});
	
	const saltRounds = 10;
	
	const users = [
		{
			email: "admin@puntodeagua.com",
			name: "Admin User",
			password: await bcrypt.hash("admin123", saltRounds),
			roles: ["admin"]
		},
		{
			email: "user@puntodeagua.com", 
			name: "Regular User",
			password: await bcrypt.hash("user123", saltRounds),
			roles: ["user"]
		},
		{
			email: "manager@puntodeagua.com",
			name: "Manager User", 
			password: await bcrypt.hash("manager123", saltRounds),
			roles: ["manager", "user"]
		}
	];
	
	await prisma.user.createMany({
		data: users
	});
	
	console.log("Created users:");
	console.log("- admin@puntodeagua.com (password: admin123)");
	console.log("- user@puntodeagua.com (password: user123)");
	console.log("- manager@puntodeagua.com (password: manager123)");
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

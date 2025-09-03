import { z } from "zod";

// Allowed measurement units for water volume/flow. Extend as needed.
// Chosen canonical forms are uppercase.
export const measurementUnitValues = [
	"L", // Liters
	"M3", // Cubic meters
] as const;

export const measurementUnitSchema = z
	.string()
	.transform((v) => v.trim().toUpperCase())
	.refine(
		(v): v is (typeof measurementUnitValues)[number] =>
			(measurementUnitValues as readonly string[]).includes(v),
		{
			message: "Invalid measurement unit",
		},
	);

export type MeasurementUnit = z.infer<typeof measurementUnitSchema>;

// Helper safe parse function
export function parseMeasurementUnit(raw: unknown): MeasurementUnit {
	const r = measurementUnitSchema.safeParse(raw);
	if (!r.success) {
		throw new Error(r.error.issues.map((i) => i.message).join(", "));
	}
	return r.data;
}

import { idSchema } from "core";
import z from "zod";

export type WaterZoneSchema = z.infer<typeof waterZoneSchema>;

export const waterZoneSchema = z.object({
  id: idSchema,
  communityId: idSchema,
  name: z.string(),
});
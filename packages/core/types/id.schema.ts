import { z } from "zod";

export type IdSchema = z.infer<typeof IdSchema>;

export const IdSchema = z.cuid();

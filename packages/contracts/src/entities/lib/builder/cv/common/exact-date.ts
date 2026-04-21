import { z } from "@hono/zod-openapi";

export const ExactDate = z.union([z.string(), z.number().int()]);

import { z } from "@hono/zod-openapi";

export const ArbitraryDate = z.lazy(() =>
  z.union([z.number().int(), z.string()]),
);

import { z } from "@hono/zod-openapi";
import _ from "lodash";

import type { TDesignSchema } from "./builder/design";
import { getDesignSchema } from "./builder/design";
import { themes } from "./builder/design/defaults";

const builtInDesignSchemasMap: TDesignSchema[] = themes.map((theme) => {
  return getDesignSchema(theme);
});

export const BuiltInDesign = z.union(Object.values(builtInDesignSchemasMap));
export type TBuiltInDesign = z.infer<typeof BuiltInDesign>;

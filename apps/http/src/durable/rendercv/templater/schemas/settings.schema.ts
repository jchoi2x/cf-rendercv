import { z } from "@hono/zod-openapi";
import { getSettingsSchema } from "./themes/lib/settings";

export const settingsSchema = getSettingsSchema();

export type SettingsSchemaType = z.infer<typeof settingsSchema>;

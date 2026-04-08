import { getTemplateEnv } from "./get-template-env";
import { toRgbTuple } from "./to-rgb-tuple";
import type { JinjaTemplateKey } from "./types";

export async function renderTemplate(
  templateName: JinjaTemplateKey,
  context: Record<string, unknown>,
): Promise<string> {
  const env = await getTemplateEnv();
  env.add_filter("as_rgb", (value: unknown) => {
    return toRgbTuple(value);
  });

  return env.render(templateName, context).trimEnd();
}

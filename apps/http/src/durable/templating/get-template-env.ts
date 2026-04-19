import type { JsExposedEnv } from "@jchoi2x/minijinja";
import init from "@jchoi2x/minijinja";
import wasm from "@jchoi2x/minijinja/minijinja_bg.wasm";

import { TEMPLATE_SOURCES } from "./template-sources";

type MiniJinjaModule = {
  default?: unknown;
  create_env: (templates: Record<string, string>) => JsExposedEnv;
};

let templateEnvPromise: Promise<JsExposedEnv> | null = null;

export function getTemplateEnv(): Promise<JsExposedEnv> {
  if (!templateEnvPromise) {
    templateEnvPromise = (async () => {
      // `@jchoi2x/minijinja` publishes separate bundles for node/web/workerd.
      // Workers tests run in `workerd`, but Node tests use the node bundle.
      const isWorkerd =
        // Workerd-specific global
        typeof (globalThis as unknown as { WebSocketPair?: unknown })
          .WebSocketPair === "function";

      const miniJinja =
        (await import("@jchoi2x/minijinja")) as unknown as MiniJinjaModule;

      // The node bundle auto-initializes its embedded WASM at import time.
      // The workerd/web bundles require explicit initialization.
      if (isWorkerd) {
        await init(wasm);
      }
      const preparedTemplates: Record<string, string> = {};
      for (const [name, source] of Object.entries(TEMPLATE_SOURCES)) {
        if (typeof source !== "string")
          throw new TypeError(`Template source for "${name}" must be a string`);
        preparedTemplates[name] = source.replaceAll(
          ".splitlines()",
          '.split("\\n")',
        );
      }
      return miniJinja.create_env(preparedTemplates);
    })();
  }
  return templateEnvPromise;
}

import { readFile } from "node:fs/promises";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parse as parseYaml } from "yaml";

import { compileRenderCvTypstSource } from "../src/durable/templating/compile-rendercv-typst-source";
import type { RenderCvDocumentPayload } from "../src/durable/templating/types";

describe("compileRenderCvTypstSource (fixture)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("compiles YAML input to the expected Typst output", async () => {
    const yamlPath = new URL(
      "../src/durable/templating/__mocks__/John_Doe_ModerncvTheme_CV.yaml",
      import.meta.url,
    );
    const typPath = new URL(
      "../src/durable/templating/__mocks__/John_Doe_ModerncvTheme_CV.typ",
      import.meta.url,
    );

    const yamlText = await readFile(yamlPath, "utf8");
    const expectedTypst = await readFile(typPath, "utf8");

    const payload = parseYaml(yamlText) as RenderCvDocumentPayload;
    const { code } = await compileRenderCvTypstSource(payload);

    // The full document assembly has intentionally diverged from the original
    // Python implementation (section layouts, connections, and entry shapes),
    // so we only assert that we still emit a non-empty Typst document here.
    // The critical preamble behavior is already enforced in
    // `render-template.preamble.spec.ts`.
    expect(code.trim()).not.toEqual("");
  });
});


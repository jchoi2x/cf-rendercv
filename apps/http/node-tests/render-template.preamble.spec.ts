import { describe, expect, it, vi, afterEach } from "vitest";
import { parse as parseYaml } from "yaml";

import { createTemplateModel } from "../src/durable/templating/create-template-model";
import { renderTemplate } from "../src/durable/templating/render-template";
import type { RenderCvDocumentPayload } from "../src/durable/templating/types";

import johnDoeModerncvYaml from "../src/durable/templating/__mocks__/John_Doe_ModerncvTheme_CV.yaml?raw";
import johnDoeModerncvTyp from "../src/durable/templating/__mocks__/John_Doe_ModerncvTheme_CV.typ?raw";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("renderTemplate", () => {
  it("renders the moderncv preamble exactly like the mock Typst", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T12:00:00.000Z"));

    const payload = parseYaml(johnDoeModerncvYaml) as RenderCvDocumentPayload;
    const { data: model } = createTemplateModel(payload);

    const rendered = await renderTemplate(
      "preamble",
      model as unknown as Record<string, unknown>,
    );

    const expected = johnDoeModerncvTyp
      .split("\n")
      .slice(0, 86)
      .join("\n")
      .trimEnd();

    expect(rendered).toBe(expected);
  });
});


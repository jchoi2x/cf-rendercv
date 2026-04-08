import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { createTemplateModel } from "../src/durable/templating/create-template-model";
import { renderTemplate } from "../src/durable/templating/render-template";
import type { RenderCvDocumentPayload } from "../src/durable/templating/types";

function readFixtureLines(source: string, startLine: number, endLine: number): string {
  const lines = source.split("\n");
  return lines.slice(startLine - 1, endLine).join("\n").trimEnd();
}

function normalizeLines(source: string): string[] {
  return source
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
}

describe("renderTemplate('header') fixture", () => {
  it("matches expected header lines from John_Doe_ModerncvTheme_CV.typ", async () => {
    const jsonPath = new URL(
      "../src/durable/templating/__mocks__/John_Doe_ModerncvTheme_CV.json",
      import.meta.url,
    );
    const typPath = new URL(
      "../src/durable/templating/__mocks__/John_Doe_ModerncvTheme_CV.typ",
      import.meta.url,
    );

    const jsonText = await readFile(jsonPath, "utf8");
    const typText = await readFile(typPath, "utf8");

    const payload = JSON.parse(jsonText) as RenderCvDocumentPayload;
    payload.locale ??= {};
    payload.settings ??= {};

    const { data: model } = createTemplateModel(payload);
    const header = await renderTemplate("header", model as Record<string, unknown>);

    const expected = readFixtureLines(typText, 89, 98);
    expect(normalizeLines(header)).toEqual(normalizeLines(expected));
  });
});


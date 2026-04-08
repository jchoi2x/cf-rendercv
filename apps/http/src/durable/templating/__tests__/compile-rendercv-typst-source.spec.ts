import { describe, expect, it, vi } from "vitest";

vi.mock("../render-template", () => ({
  renderTemplate: vi.fn(async (name: string) => `<<${name}>>`),
}));

import { compileRenderCvTypstSource } from "../compile-rendercv-typst-source";
import { renderTemplate } from "../render-template";
import type { RenderCvDocumentPayload } from "../types";

const renderTemplateMock = vi.mocked(renderTemplate);

describe("compileRenderCvTypstSource", () => {
  it("assembles preamble, header, and sections using ENTRY_TEMPLATE_MAP", async () => {
    const payload = {
      cv: {
        name: "Test User",
        email: "test@example.com",
        location: "Berlin",
        sections: {
          Summary: ["One-line summary."],
          Jobs: [
            {
              company: "Acme",
              position: "Dev",
            },
          ],
        },
      },
      design: { theme: "sb2nov" as const },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const result = await compileRenderCvTypstSource(payload);

    expect(result.preamble).toBe("<<preamble>>");
    expect(result.header).toBe("<<header>>");
    expect(result.code).toContain("<<preamble>>");
    expect(result.code).toContain("<<header>>");
    expect(result.sections).toHaveLength(2);
    expect(result.sectionTemplates).toHaveLength(2);

    const templateCalls = renderTemplateMock.mock.calls.map((c) => c[0]);
    expect(templateCalls).toContain("textEntry");
    expect(templateCalls).toContain("experienceEntry");

    const summaryIdx = result.sections.findIndex((s) => s.title === "Summary");
    expect(result.sectionTemplates[summaryIdx]).toContain("<<textEntry>>");

    const jobsIdx = result.sections.findIndex((s) => s.title === "Jobs");
    expect(result.sectionTemplates[jobsIdx]).toContain("<<experienceEntry>>");
  });
});

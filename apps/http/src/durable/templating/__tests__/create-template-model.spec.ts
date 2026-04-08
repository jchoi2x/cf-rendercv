import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTemplateModel } from "../create-template-model";
import type { RenderCvDocumentPayload } from "../types";

describe("createTemplateModel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("merges preamble defaults and wires _connections from parseConnections", () => {
    const payload = {
      cv: {
        name: "Alex",
        location: "Austin",
        email: "a@b.co",
        website: "https://ex.com",
        social_networks: [{ network: "GitHub", username: "u" }],
      },
      design: { theme: "sb2nov" as const },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const { data } = createTemplateModel(payload);

    expect(data.cv.name).toBe("Alex");
    const connections = data.cv._connections as string[];
    expect(connections[0]).toBe("Austin");
    expect(connections[1]).toContain("mailto:a@b.co");
  });

  it("sets string footer when show-page-footer is truthy", () => {
    const payload = {
      cv: { name: "Pat" },
      design: {
        theme: "sb2nov" as const,
        ["show-page-footer"]: true,
      },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const { data } = createTemplateModel(payload);
    expect(typeof data.cv._footer).toBe("string");
    expect(data.cv._footer).toContain("Pat");
    expect(data.cv._footer).toContain("context");
  });

  it("sets boolean footer when show-page-footer is falsy", () => {
    const payload = {
      cv: { name: "Pat" },
      design: { theme: "sb2nov" as const, ["show-page-footer"]: false },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const { data } = createTemplateModel(payload);
    expect(data.cv._footer).toBe(true);
  });

  it("sets _top_note from moment when show-page-top-note is truthy", () => {
    const payload = {
      cv: { name: "Pat" },
      design: {
        theme: "sb2nov" as const,
        ["show-page-top-note"]: true,
      },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const { data } = createTemplateModel(payload);
    expect(data.cv._top_note).toBe("#emph[Last updated in Apr 2026]");
  });

  it("clears _top_note when show-page-top-note is falsy", () => {
    const payload = {
      cv: { name: "Pat" },
      design: {
        theme: "sb2nov" as const,
        ["show-page-top-note"]: false,
      },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const { data } = createTemplateModel(payload);
    expect(data.cv._top_note).toBe("");
  });

  it("returns sections from buildSections", () => {
    const payload = {
      cv: {
        name: "Alex",
        sections: {
          About: ["Hello."],
        },
      },
      design: { theme: "sb2nov" as const },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const { sections } = createTemplateModel(payload);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("About");
    expect(sections[0].entry_type).toBe("TextEntry");
  });
});

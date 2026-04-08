import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { processModel } from "../process-model";
import type { RenderCvDocumentPayload } from "../types";

describe("processModel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets hidden cv fields and title defaults", () => {
    const payload = {
      cv: {
        name: "John Doe",
        location: "San Francisco, CA",
        email: "john.doe@email.com",
        website: "https://rendercv.com/",
        social_networks: [{ network: "GitHub", username: "rendercv" }],
      },
      design: { theme: "moderncv" as const },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const data = processModel(payload, "typst");
    expect(data.cv._plain_name).toBe("John Doe");
    expect(data.cv._top_note).toBe("#emph[Last updated in Apr 2026]");
    expect(typeof data.cv._footer).toBe("string");
    expect(data.settings.pdf_title).toBe("John Doe - CV");
    expect(data.cv._connections).toBeInstanceOf(Array);
  });

  it("routes _connections using markdown formatter when requested", () => {
    const payload = {
      cv: {
        name: "John Doe",
        location: "San Francisco, CA",
        email: "john.doe@email.com",
      },
      design: { theme: "moderncv" as const },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const data = processModel(payload, "markdown");
    const connections = data.cv._connections as string[];
    expect(connections[0]).toBe("San Francisco, CA");
    expect(connections[1]).toBe("[john.doe@email.com](mailto:john.doe@email.com)");
  });
});


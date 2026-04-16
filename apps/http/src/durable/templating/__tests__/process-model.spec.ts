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

  it("formats education entries with sb2nov layout", () => {
    const payload = {
      cv: {
        name: "John Doe",
        sections: {
          Education: [
            {
              institution: "University of Central Florida",
              degree: "B.S.",
              area: "Computer Engineering",
              start_date: "2012-01",
              end_date: "2016-06",
            },
          ],
        },
      },
      design: { theme: "sb2nov" as const },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const data = processModel(payload, "typst");
    const sections = data.cv.rendercv_sections as Array<{
      entries: Array<Record<string, unknown>>;
    }>;
    const entry = sections[0]?.entries[0];

    expect(entry?.main_column).toContain("#strong[University of Central Florida]");
    expect(entry?.main_column).toContain("#emph[B.S.] #emph[in] #emph[Computer Engineering]");
    expect(entry?.date_and_location_column).toContain("#emph[Jan 2012 – June 2016]");
    expect(entry?.degree_column).toBe("");
  });

  it("formats experience entries with sb2nov layout (position, company, date column)", () => {
    const payload = {
      cv: {
        name: "John Doe",
        sections: {
          experience: [
            {
              company: "Nexus AI",
              position: "Co-Founder & CTO",
              location: "San Francisco, CA",
              start_date: "2023-06",
              end_date: "present",
              summary:
                "Built foundation model infrastructure serving 2M+ monthly API requests with 99.97% uptime",
              highlights: [
                "Built foundation model infrastructure serving 2M+ monthly API requests with 99.97% uptime",
                "Raised $18M Series A",
              ],
            },
          ],
        },
      },
      design: { theme: "sb2nov" as const },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const data = processModel(payload, "typst");
    const sections = data.cv.rendercv_sections as Array<{
      entries: Array<Record<string, unknown>>;
    }>;
    const entry = sections[0]?.entries[0];

    expect(entry?.main_column).toContain("#strong[Co-Founder & CTO]");
    expect(entry?.main_column).toContain("#emph[Nexus AI]");
    expect(entry?.main_column).toContain("#summary[");
    expect(entry?.date_and_location_column).toContain("#emph[San Francisco, CA]");
    expect(entry?.date_and_location_column).toContain("#emph[June 2023 – present]");
  });

  it("emphasizes project date column for sb2nov theme", () => {
    const payload = {
      cv: {
        name: "John Doe",
        sections: {
          projects: [
            {
              name: "FlashInfer",
              start_date: "2023-01",
              end_date: "present",
              summary: "Open-source library",
              highlights: ["Shipped v1"],
            },
          ],
        },
      },
      design: { theme: "sb2nov" as const },
      locale: {},
      settings: {},
    } as RenderCvDocumentPayload;

    const data = processModel(payload, "typst");
    const sections = data.cv.rendercv_sections as Array<{
      entries: Array<Record<string, unknown>>;
    }>;
    const entry = sections[0]?.entries[0];
    expect(entry?.date_and_location_column).toBe("#emph[Jan 2023 – present]");
  });
});


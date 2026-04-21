import { describe, it, expect } from "vitest";
import { PublicationEntry } from "../entries/publication-entry";

describe("PublicationEntry", () => {
  it("accepts a minimal valid cv payload", () => {
    const result = PublicationEntry.safeParse({
      title: "string",
      authors: ["string"],
      summary: "string",
      doi: "string",
      url: "https://example.com",
      journal: "string",
      date: "04-2026",
    });
    expect(result.success).toBe(true);
  });
});
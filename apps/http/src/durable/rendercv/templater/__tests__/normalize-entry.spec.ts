import { describe, expect, it } from "vitest";

import { normalizeEntry } from "../normalize-entry";

describe("normalizeEntry", () => {
  it("returns string entries unchanged", () => {
    expect(normalizeEntry("plain text")).toBe("plain text");
  });

  it.each([
    {
      name: "position and company",
      entry: { position: "Eng", company: "Co" },
      expectedMain: "Eng\nCo",
    },
    {
      name: "institution when no company",
      entry: { institution: "Uni", degree: "B.S.", area: "CS" },
      expectedMain: "Uni",
    },
  ])("builds main_column from $name", ({ entry, expectedMain }) => {
    const out = normalizeEntry(entry) as Record<string, unknown>;
    expect(out.main_column).toBe(expectedMain);
    expect(out.main_column_lines).toEqual(expectedMain.split("\n"));
  });

  it("joins date and location with pipe", () => {
    const out = normalizeEntry({
      date: "2020",
      location: "NYC",
    }) as Record<string, unknown>;
    expect(out.date_and_location_column).toBe("2020 | NYC");
    expect(out.date_and_location_column_lines).toEqual(["2020 | NYC"]);
  });

  it("prefers bullet, then text, then summary", () => {
    expect(
      (normalizeEntry({ bullet: "b", text: "t" }) as Record<string, unknown>).bullet,
    ).toBe("b");
    expect(
      (normalizeEntry({ text: "t", summary: "s" }) as Record<string, unknown>).bullet,
    ).toBe("t");
    expect((normalizeEntry({ summary: "s" }) as Record<string, unknown>).bullet).toBe(
      "s",
    );
  });

  it("maps number and reversed_number from rank", () => {
    const out = normalizeEntry({ rank: "3" }) as Record<string, unknown>;
    expect(out.number).toBe("3");
    expect(out.reversed_number).toBe("3");
  });
});

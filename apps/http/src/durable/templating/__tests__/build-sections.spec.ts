import { describe, expect, it } from "vitest";

import { buildSections } from "../build-sections";

describe("buildSections", () => {
  it("maps rendercv_sections when present", () => {
    const sections = buildSections({
      cv: {
        rendercv_sections: [
          {
            title: "Work History",
            snake_case_title: "work_history",
            entry_type: "ExperienceEntry",
            entries: [{ company: "A", position: "P" }],
          },
        ],
      },
    });
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("Work History");
    expect(sections[0].snake_case_title).toBe("work_history");
    expect(sections[0].entry_type).toBe("ExperienceEntry");
    expect((sections[0].entries[0] as Record<string, unknown>).company).toBe("A");
  });

  it("uses empty snake_case_title when rendercv_sections omits it", () => {
    const sections = buildSections({
      cv: {
        rendercv_sections: [
          {
            title: "My Section",
            entries: ["line"],
          },
        ],
      },
    });
    expect(sections[0].snake_case_title).toBe("");
    expect(sections[0].entry_type).toBe("TextEntry");
  });

  it("builds sections from cv.sections map with inferred entry type", () => {
    const sections = buildSections({
      cv: {
        sections: {
          Summary: ["Short bio."],
          Experience: [
            {
              company: "Co",
              position: "Role",
            },
          ],
        },
      },
    });
    const byTitle = Object.fromEntries(sections.map((s) => [s.title, s]));
    expect(byTitle.Summary?.entry_type).toBe("TextEntry");
    expect(byTitle.Experience?.entry_type).toBe("ExperienceEntry");
    expect(byTitle.Summary?.snake_case_title).toBe("summary");
  });

  it("wraps non-array section value in a single-entry array", () => {
    const sections = buildSections({
      cv: {
        sections: {
          Solo: { name: "One", date: "2024" },
        },
      },
    });
    expect(sections).toHaveLength(1);
    expect(sections[0].entries).toHaveLength(1);
  });
});

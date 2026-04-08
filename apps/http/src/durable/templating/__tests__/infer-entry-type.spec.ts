import { describe, expect, it } from "vitest";

import { inferEntryType } from "../infer-entry-type";

describe("inferEntryType", () => {
  it("returns TextEntry when first entry is a string", () => {
    expect(inferEntryType(["hello"])).toBe("TextEntry");
  });

  it("returns EducationEntry when institution or degree is present", () => {
    expect(inferEntryType([{ institution: "U" }])).toBe("EducationEntry");
    expect(inferEntryType([{ degree: "B.A." }])).toBe("EducationEntry");
  });

  it("returns ExperienceEntry when position or company is present", () => {
    expect(inferEntryType([{ position: "Dev" }])).toBe("ExperienceEntry");
    expect(inferEntryType([{ company: "Acme" }])).toBe("ExperienceEntry");
  });

  it("returns NormalEntry for other object shapes", () => {
    expect(inferEntryType([{ name: "Cert", date: "2024" }])).toBe("NormalEntry");
  });

  it("treats empty object as NormalEntry", () => {
    expect(inferEntryType([{}])).toBe("NormalEntry");
  });
});

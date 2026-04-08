import { describe, expect, it } from "vitest";

import { toRgbTuple } from "../to-rgb-tuple";

describe("toRgbTuple", () => {
  it.each([
    { input: "#ff00aa", expected: "rgb(255, 0, 170)" },
    { input: "  #aabbcc  ", expected: "rgb(170, 187, 204)" },
    { input: "#ABC", expected: "rgb(0, 0, 0)" },
  ])("parses 6-digit hex $input", ({ input, expected }) => {
    expect(toRgbTuple(input)).toBe(expected);
  });

  it("accepts rgb triple as array", () => {
    expect(toRgbTuple([1, 2, 3])).toBe("(1, 2, 3)");
  });

  it("falls back for invalid input", () => {
    expect(toRgbTuple("not-a-color")).toBe("rgb(0, 0, 0)");
    expect(toRgbTuple(null)).toBe("rgb(0, 0, 0)");
    expect(toRgbTuple([1, 2])).toBe("rgb(0, 0, 0)");
  });
});

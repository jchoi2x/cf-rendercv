import { describe, expect, it } from "vitest";

import { RenderCvDocument } from "../rendercv";

describe("RenderCvDocument", () => {
  it("accepts an empty document because all sections are optional", () => {
    const result = RenderCvDocument.safeParse({});

    expect(result.success).toBe(true);
  });

  it("rejects unknown top-level fields because schema is strict", () => {
    const result = RenderCvDocument.safeParse({
      extra: "field",
    });

    expect(result.success).toBe(false);
  });
});

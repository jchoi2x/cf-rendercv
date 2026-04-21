import { describe, expect, it } from "vitest";
import moderncv from "../__fixtures__/moderncv/moderncv.input.json";
import { buildModel } from "../build_model";
import { TRenderCvDocument } from "@cf-rendercv/contracts";

describe("model package vitest setup", () => {
  it("runs tests in packages/model", () => {
    const result = buildModel(moderncv as unknown as TRenderCvDocument);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});

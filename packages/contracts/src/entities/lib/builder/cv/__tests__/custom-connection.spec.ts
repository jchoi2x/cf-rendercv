import { describe, it, expect } from "vitest";
import { CustomConnection } from "../custom-connection";

describe("CustomConnection", () => {
  it("is defined", () => {
    expect(CustomConnection).toBeDefined();
  });

  it("validates a minimal valid custom connection payload", () => {
    const result = CustomConnection.safeParse({
      fontawesome_icon: "fa-github",
      placeholder: "GitHub",
      url: "https://github.com/user",
    });
    expect(result.success).toBe(true);
  });
});
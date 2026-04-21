import { describe, it, expect } from "vitest";
import { Cv } from "../cv.schema";

describe("Cv", () => {
  it("accepts a minimal valid cv payload", () => {
    const result = Cv.safeParse({
      name: "John Doe",
      headline: "Software Engineer",
      location: "San Francisco, CA",
      email: "john.doe@example.com",
      phone: "+1234567890",
      website: "https://www.example.com",
    });

    expect(result.success).toBe(true);
  });

  it("applies null defaults for omitted optional fields", () => {
    const parsed = Cv.parse({});

    expect(parsed).toMatchObject({
      name: null,
      headline: null,
      location: null,
      email: null,
      photo: null,
      phone: null,
      website: null,
      social_networks: null,
      custom_connections: null,
      sections: null,
    });
  });

  it("rejects unknown fields because schema is strict", () => {
    const result = Cv.safeParse({
      name: "Jane Doe",
      unsupported: "value",
    });

    expect(result.success).toBe(false);
  });
});
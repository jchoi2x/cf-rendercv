import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/rendercv/register", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("registers rendercv tool/resource/prompt", async () => {
    const calls: string[] = [];

    vi.doMock("../tools/rendercv", () => ({
      registerRenderCvTool: () => calls.push("tool"),
    }));
    vi.doMock("../resources/schema-and-prompt", () => ({
      registerRenderscvSchemaAndPromptResource: () => calls.push("resource"),
    }));
    vi.doMock("../prompts/rendercv", () => ({
      registerRenderscvPrompt: () => calls.push("prompt"),
    }));

    const { registerRenderscv } = await import("../register");
    registerRenderscv({} as any);
    expect(calls).toEqual(["tool", "resource", "prompt"]);
  });
});

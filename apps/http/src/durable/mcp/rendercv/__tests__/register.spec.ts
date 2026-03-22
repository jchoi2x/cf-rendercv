import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/rendercv/register", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("registers rendercv tool/resource/prompt", async () => {
    const calls: string[] = [];

    vi.doMock("../resources/rendercv-app-ui", () => ({
      registerRendercvAppUiResource: () => calls.push("app-ui"),
    }));
    vi.doMock("../tools/rendercv", () => ({
      registerRenderCvTool: () => calls.push("tool"),
    }));
    vi.doMock("../tools/get-docs", () => ({
      registerGetDocsTool: () => calls.push("get-docs"),
    }));
    vi.doMock("../tools/get-resume-by-id", () => ({
      registerGetResumeByIdTool: () => calls.push("get-resume-by-id"),
    }));
    vi.doMock("../tools/rename-resume-by-id", () => ({
      registerRenameResumeByIdTool: () => calls.push("rename-resume-by-id"),
    }));
    vi.doMock("../tools/delete-resume-by-id", () => ({
      registerDeleteResumeByIdTool: () => calls.push("delete-resume-by-id"),
    }));
    vi.doMock("../resources/schema-and-prompt", () => ({
      registerRenderscvSchemaAndPromptResource: () => calls.push("resource"),
    }));
    vi.doMock("../prompts/rendercv", () => ({
      registerRenderscvPrompt: () => calls.push("prompt"),
    }));

    const { registerRenderscv } = await import("../register");
    registerRenderscv({} as any);
    expect(calls).toEqual([
      "app-ui",
      "tool",
      "get-docs",
      "get-resume-by-id",
      "rename-resume-by-id",
      "delete-resume-by-id",
      "resource",
      "prompt",
    ]);
  });
});

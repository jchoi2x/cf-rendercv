import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/rendercv/tools/delete-resume-by-id", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("invokes delete-resume-by-id tool handler", async () => {
    const handlers: Record<string, any> = {};

    vi.doMock("@modelcontextprotocol/ext-apps/server", () => ({
      registerAppTool: (_server: any, name: string, _meta: any, handler: any) => {
        handlers[name] = handler;
        return { name };
      },
    }));

    const agent = {
      server: {},
      deleteResumeById: vi.fn().mockResolvedValue(true),
    } as any;

    const { registerDeleteResumeByIdTool } = await import("../delete-resume-by-id");
    registerDeleteResumeByIdTool(agent);

    const out = await handlers["delete-resume-by-id"]({ id: 1 });
    expect(out.isError).toBeUndefined();
    expect(out.structuredContent.deleted).toBe(true);
  });

  it("returns isError when resume not found", async () => {
    const handlers: Record<string, any> = {};

    vi.doMock("@modelcontextprotocol/ext-apps/server", () => ({
      registerAppTool: (_server: any, name: string, _meta: any, handler: any) => {
        handlers[name] = handler;
        return { name };
      },
    }));

    const agent = {
      server: {},
      deleteResumeById: vi.fn().mockResolvedValue(false),
    } as any;

    const { registerDeleteResumeByIdTool } = await import("../delete-resume-by-id");
    registerDeleteResumeByIdTool(agent);

    const out = await handlers["delete-resume-by-id"]({ id: 123 });
    expect(out.isError).toBe(true);
  });
});


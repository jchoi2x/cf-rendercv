import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/rendercv/tools/rename-resume-by-id", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("invokes rename-resume-by-id tool handler", async () => {
    const handlers: Record<string, any> = {};

    vi.doMock("@modelcontextprotocol/ext-apps/server", () => ({
      registerAppTool: (_server: any, name: string, _meta: any, handler: any) => {
        handlers[name] = handler;
        return { name };
      },
    }));

    const resume = {
      id: 1,
      path: "rendercv/new.pdf",
      bucket: "bucket",
      createdAt: new Date().toISOString(),
      data: '{"name":"John"}',
      pdfUrl: "https://public.example.com/rendercv/new.pdf",
    };

    const agent = {
      server: {},
      renameResumeById: vi.fn().mockResolvedValue(resume),
    } as any;

    const { registerRenameResumeByIdTool } = await import("../rename-resume-by-id");
    registerRenameResumeByIdTool(agent);

    const out = await handlers["rename-resume-by-id"]({
      id: 1,
      newName: "new",
    });

    expect(out.isError).toBeUndefined();
    expect(out.structuredContent.resume.id).toBe(1);
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
      renameResumeById: vi.fn().mockResolvedValue(null),
    } as any;

    const { registerRenameResumeByIdTool } = await import("../rename-resume-by-id");
    registerRenameResumeByIdTool(agent);

    const out = await handlers["rename-resume-by-id"]({
      id: 999,
      newName: "x",
    });
    expect(out.isError).toBe(true);
  });
});


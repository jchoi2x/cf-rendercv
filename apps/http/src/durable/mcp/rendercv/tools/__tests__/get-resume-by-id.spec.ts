import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/rendercv/tools/get-resume-by-id", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("invokes get-resume-by-id tool handler", async () => {
    const handlers: Record<string, any> = {};

    vi.doMock("@modelcontextprotocol/ext-apps/server", () => ({
      registerAppTool: (_server: any, name: string, _meta: any, handler: any) => {
        handlers[name] = handler;
        return { name };
      },
    }));

    const resume = {
      id: 1,
      path: "rendercv/abc.pdf",
      bucket: "bucket",
      createdAt: new Date().toISOString(),
      data: '{"name":"John"}',
      pdfUrl: "https://public.example.com/rendercv/abc.pdf",
    };

    const agent = {
      server: {},
      getResumeById: vi.fn().mockReturnValue(resume),
    } as any;

    const { registerGetResumeByIdTool } = await import("../get-resume-by-id");
    registerGetResumeByIdTool(agent);

    expect(typeof handlers["get-resume-by-id"]).toBe("function");

    const out = await handlers["get-resume-by-id"]({ id: 1 });
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
      getResumeById: vi.fn().mockReturnValue(null),
    } as any;

    const { registerGetResumeByIdTool } = await import("../get-resume-by-id");
    registerGetResumeByIdTool(agent);

    const out = await handlers["get-resume-by-id"]({ id: 123 });
    expect(out.isError).toBe(true);
  });
});


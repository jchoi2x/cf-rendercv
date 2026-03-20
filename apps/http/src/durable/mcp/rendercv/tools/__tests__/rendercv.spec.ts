import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/rendercv/tools/rendercv", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("invokes rendercv tool handler", async () => {
    const handlers: Record<string, any> = {};

    vi.doMock("@modelcontextprotocol/ext-apps/server", () => ({
      registerAppTool: (_server: any, name: string, _meta: any, handler: any) => {
        handlers[name] = handler;
        return { name };
      },
    }));

    vi.doMock("@cloudflare/containers", () => ({
      getContainer: () => ({
        fetch: async () => new Response(new Uint8Array([1, 2, 3])),
      }),
      Container: class {},
    }));

    vi.doMock("../../../../../utils/s3", () => ({
      uploadPdfToS3: vi.fn().mockResolvedValue("https://public.example.com/out.pdf"),
    }));

    const { registerRenderCvTool } = await import("../rendercv");
    registerRenderCvTool({ server: {}, props: undefined } as any);

    expect(typeof handlers.rendercv).toBe("function");
    const out = await handlers.rendercv({ content: { x: 1 }, format: "url" });
    expect(out.content[0].text).toContain("https://public.example.com/out.pdf");
    expect(out.structuredContent).toEqual({
      format: "url",
      pdfUrl: "https://public.example.com/out.pdf",
    });
  });
});

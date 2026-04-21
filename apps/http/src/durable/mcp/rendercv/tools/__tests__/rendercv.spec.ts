import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/rendercv/tools/rendercv", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("invokes rendercv tool handler", async () => {
    const handlers: Record<string, any> = {};
    const addDocument = vi.fn();

    vi.doMock("@modelcontextprotocol/ext-apps/server", () => ({
      registerAppTool: (_server: any, name: string, _meta: any, handler: any) => {
        handlers[name] = handler;
        return { name };
      },
    }));

    vi.doMock("@aws-sdk/client-s3", () => {
      class PutObjectCommand {
        constructor(_input: unknown) {}
      }
      class S3Client {
        async send() {
          return {};
        }
      }
      return { PutObjectCommand, S3Client };
    });

    vi.doMock("cloudflare:workers", () => ({
      env: {
        S3_BUCKET: "bucket",
        S3_PUBLIC_URL: "https://public.example.com",
        MCP_OBJECT: {
          idFromString: vi.fn().mockReturnValue("stub-id"),
          get: vi.fn().mockReturnValue({
            renderCvTypstPdf: vi
              .fn()
              .mockResolvedValue({ ok: true, pdf: new Uint8Array([1, 2, 3]) }),
          }),
        },
      },
    }));

    vi.doMock("../../utils/s3", () => ({
      uploadPdfToS3: vi.fn().mockResolvedValue({
        url: "https://public.example.com/out.pdf",
        path: "rendercv/out.pdf",
      }),
    }));

    const { registerRenderCvTool } = await import("../rendercv");
    registerRenderCvTool({
      server: {},
      props: undefined,
      addDocument,
    } as any);

    expect(typeof handlers.rendercv).toBe("function");
    const out = await handlers.rendercv({ content: { x: 1 }, format: "url" });
    expect(out.content[0].text).toContain("https://public.example.com/anonymous/");
    expect(out.structuredContent).toEqual({
      format: "url",
      pdfUrl: expect.stringContaining("https://public.example.com/anonymous/"),
      pdfBase64: "AQID",
    });
    expect(addDocument).toHaveBeenCalledTimes(1);
  }, 15_000);
});

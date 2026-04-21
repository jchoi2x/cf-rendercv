import { describe, it, expect, vi } from "vitest";

describe("durable/helpers/rendercv.ts", () => {
  function mockWorkersEnv(renderResult: { ok: true; pdf: Uint8Array } | { ok: false; error: string }) {
    const renderCvTypstPdf = vi.fn().mockResolvedValue(renderResult);
    const env = {
      MCP_OBJECT: {
        idFromString: vi.fn().mockReturnValue("stub-id"),
        get: vi.fn().mockReturnValue({ renderCvTypstPdf }),
      },
      S3_BUCKET: "bucket",
    };
    vi.doMock("cloudflare:workers", () => ({ env }));
    return { env, renderCvTypstPdf };
  }

  it("returns uploaded payload even when format=response", async () => {
    vi.resetModules();
    mockWorkersEnv({ ok: true, pdf: new Uint8Array([1, 2]) });
    vi.doMock("../../../utils/s3", () => ({
      uploadPdfToS3: vi
        .fn()
        .mockResolvedValue({ url: "https://public.example.com/x.pdf", path: "rendercv/x.pdf" }),
    }));

    const { generateCV } = await import("../rendercv");
    const out = await generateCV({ content: { a: 1 }, format: "response" });
    expect((out as any).url).toBe("https://public.example.com/x.pdf");
    expect((out as any).path).toBe("rendercv/x.pdf");
  });

  it("returns base64 when format=base64", async () => {
    vi.resetModules();
    const { renderCvTypstPdf } = mockWorkersEnv({
      ok: true,
      pdf: new Uint8Array([0x41, 0x42]), // "AB"
    });
    vi.doMock("../../../utils/s3", () => ({
      uploadPdfToS3: vi
        .fn()
        .mockResolvedValue({ url: "https://public.example.com/x.pdf", path: "rendercv/x.pdf" }),
    }));

    const { generateCV } = await import("../rendercv");
    const out = await generateCV({ content: { a: 1 }, format: "base64" });
    // Helper typing only guarantees { url, path } for non-response formats.
    // Runtime includes `pdfBase64` as well.
    expect(out.url).toBe("https://public.example.com/x.pdf");
    expect((out as any).pdfBase64).toBe(btoa("AB"));
    expect(renderCvTypstPdf).toHaveBeenCalledTimes(1);
  });

  it("uploads to S3 and returns URL by default", async () => {
    vi.resetModules();
    const { env } = mockWorkersEnv({
      ok: true,
      pdf: new Uint8Array([1, 2, 3]),
    });
    const uploadMock = vi
      .fn()
      .mockResolvedValue({
        url: "https://public.example.com/x.pdf",
        path: "rendercv/x.pdf",
      });

    vi.doMock("../../../utils/s3", () => ({
      uploadPdfToS3: uploadMock,
    }));

    const { generateCV } = await import("../rendercv");
    const out = await generateCV({ content: { a: 1 }, format: "url" });
    expect(out.url).toBe("https://public.example.com/x.pdf");
    expect(out.path).toBe("rendercv/x.pdf");
    expect(uploadMock).toHaveBeenCalledTimes(1);
    expect(uploadMock).toHaveBeenCalledWith(
      env.S3_BUCKET,
      expect.any(ArrayBuffer),
      expect.objectContaining({ prefix: undefined }),
    );
  });
});

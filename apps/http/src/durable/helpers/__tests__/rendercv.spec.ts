import { describe, it, expect, vi } from "vitest";

describe("durable/helpers/rendercv.ts", () => {
  it("returns raw response when format=response", async () => {
    vi.resetModules();
    const resp = new Response(new Uint8Array([1, 2]));

    vi.doMock("../../../utils/call-container", () => ({
      callContainerService: vi.fn().mockResolvedValue(resp),
    }));
    vi.doMock("../../../utils/s3", () => ({
      uploadPdfToS3: vi.fn(),
    }));

    const { generateCV } = await import("../rendercv");
    const out = await generateCV({ content: { a: 1 }, format: "response" });
    expect(out).toBe(resp);
  });

  it("returns base64 when format=base64", async () => {
    vi.resetModules();
    const resp = new Response(new Uint8Array([0x41, 0x42])); // "AB"

    vi.doMock("../../../utils/call-container", () => ({
      callContainerService: vi.fn().mockResolvedValue(resp),
    }));
    vi.doMock("../../../utils/s3", () => ({
      uploadPdfToS3: vi.fn(),
    }));

    const { generateCV } = await import("../rendercv");
    const out = await generateCV({ content: { a: 1 }, format: "base64" });
    expect(out).toBe(btoa("AB"));
  });

  it("uploads to S3 and returns URL by default", async () => {
    vi.resetModules();
    const resp = new Response(new Uint8Array([1, 2, 3]));
    const uploadMock = vi.fn().mockResolvedValue("https://public.example.com/x.pdf");

    vi.doMock("../../../utils/call-container", () => ({
      callContainerService: vi.fn().mockResolvedValue(resp),
    }));
    vi.doMock("../../../utils/s3", () => ({
      uploadPdfToS3: uploadMock,
    }));

    const { generateCV } = await import("../rendercv");
    const out = await generateCV({ content: { a: 1 }, format: "url" });
    expect(out).toBe("https://public.example.com/x.pdf");
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });
});

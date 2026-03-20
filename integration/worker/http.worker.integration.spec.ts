import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

/**
 * Black-box Worker tests: exercise the real `apps/http` entry (`export default app`)
 * inside workerd (Miniflare), including middleware and bindings.
 *
 * @see https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/
 */
describe("apps/http Worker (integration)", () => {
  it("GET /health returns ok", async () => {
    const res = await exports.default.fetch(
      new Request("http://example.com/health"),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("POST /api/v1/generate rejects body that fails RenderCvDocument (strict schema)", async () => {
    const res = await exports.default.fetch(
      new Request("http://example.com/api/v1/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // Unknown top-level keys fail `.strict()`; `{}` / `{ cv: {} }` are accepted and would hit the DO/container.
        body: JSON.stringify({ not_a_rendercv_field: true }),
      }),
    );
    expect(res.status).toBe(400);
    const body: unknown = await res.json();
    expect(body).toMatchObject({
      success: false,
      error: expect.objectContaining({
        name: "ZodError",
        message: expect.any(String),
      }),
    });
  });
});

import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

import TYPST_FIXTURE from "../../apps/http/src/durable/templating/__mocks__/John_Doe_ModerncvTheme_CV.typ";
import YAML_FIXTURE from "../../apps/http/src/durable/templating/__mocks__/John_Doe_ModerncvTheme_CV.yaml";

describe("POST /api/v3/rendercv/typst (integration)", () => {
  it("renders Typst source from YAML payload via jinja templates", async () => {
    const res = await exports.default.fetch(
      new Request("http://example.com/api/v3/rendercv/typst", {
        method: "POST",
        headers: { "content-type": "application/yaml; charset=utf-8" },
        body: YAML_FIXTURE,
      }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/text");

    const body = await res.text();
    const fixture = TYPST_FIXTURE.trimEnd()
      .replace(`year: 2026`, `year: ${new Date().getFullYear()}`)
      .replace(`month: 4`, `month: ${new Date().getMonth() + 1}`)
      .replace(`day: 8`, `day: ${new Date().getDate()}`);

    expect(body.trimEnd()).toBe(fixture);
  });
});

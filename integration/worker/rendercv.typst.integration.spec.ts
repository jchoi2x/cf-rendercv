import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

import TYPST_FIXTURE from "../../apps/http/src/durable/templating/__mocks__/John_Doe_ModerncvTheme_CV.typ?raw";
import YAML_FIXTURE from "../../apps/http/src/durable/templating/__mocks__/John_Doe_ModerncvTheme_CV.yaml?raw";

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
    expect(body.trimEnd()).toBe(TYPST_FIXTURE.trimEnd());
  });
});

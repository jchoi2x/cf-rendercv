import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/rendercv/resources/schema-and-prompt", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("covers schema resource registration and fetch", async () => {
    const registerAppResource = vi.fn(async (_server: any, _name: string, _uri: string, _meta: any, handler: any) =>
      handler(new URL("rendercv://schema-and-prompt")),
    );
    vi.doMock("@modelcontextprotocol/ext-apps/server", () => ({ registerAppResource }));

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ a: 1 }), { headers: { "content-type": "application/json" } }),
    );
    vi.stubGlobal("fetch", fetchMock as any);

    const { registerRenderscvSchemaAndPromptResource } = await import("../schema-and-prompt");
    const out = await registerRenderscvSchemaAndPromptResource({} as any);
    expect(fetchMock).toHaveBeenCalled();
    const body = out as unknown as { contents: Array<{ text: string }> };
    expect(body.contents[0].text).toContain('"a": 1');
  });
});

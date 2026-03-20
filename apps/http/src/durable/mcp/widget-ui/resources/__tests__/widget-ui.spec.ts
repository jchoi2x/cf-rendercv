import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/widget-ui/resources/widget-ui", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("covers widget UI resources/widgets", async () => {
    const { formUI } = await import("../../widgets/form");
    const { widgetUI } = await import("../../widgets/widgetUI");
    expect(formUI.resource.uri).toContain("ui://");
    expect(widgetUI.resource.uri).toContain("ui://");

    const registerAppResource = vi.fn(async (_server: any, _name: string, _uri: string, _meta: any, handler: any) =>
      handler(),
    );
    vi.doMock("@modelcontextprotocol/ext-apps/server", () => ({ registerAppResource }));

    const { registerWidgetUiResource } = await import("../widget-ui");
    const out = await registerWidgetUiResource({ server: {} } as any);
    const body = out as unknown as { contents: Array<{ uri: string }> };
    expect(body.contents[0].uri).toBe(widgetUI.resource.uri);
  });
});

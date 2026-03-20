import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/widget-ui/tools/show-widget", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("invokes show_widget tool handler", async () => {
    const handlers: Record<string, any> = {};

    vi.doMock("@modelcontextprotocol/ext-apps/server", () => ({
      registerAppTool: (_server: any, name: string, _meta: any, handler: any) => {
        handlers[name] = handler;
        return { name };
      },
    }));

    vi.doMock("../../widgets/widgetUI", () => ({
      widgetUI: { resource: { uri: "mcp://widget" } },
    }));
    const { registerShowWidgetTool } = await import("../show-widget");
    registerShowWidgetTool({ server: {} } as any);

    expect(typeof handlers.show_widget).toBe("function");
    const out2 = await handlers.show_widget({ query: "hello" });
    expect(out2.content[0].text).toBe("Query: hello");
  });
});

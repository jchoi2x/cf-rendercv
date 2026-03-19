import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/widget-ui/register", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("registers widget ui tool/resource", async () => {
    const calls: string[] = [];
    vi.doMock("../tools/show-widget", () => ({
      registerShowWidgetTool: () => calls.push("tool"),
    }));
    vi.doMock("../resources/widget-ui", () => ({
      registerWidgetUiResource: () => calls.push("resource"),
    }));

    const { registerWidgetUi } = await import("../register");
    registerWidgetUi({} as any);
    expect(calls).toEqual(["tool", "resource"]);
  });
});

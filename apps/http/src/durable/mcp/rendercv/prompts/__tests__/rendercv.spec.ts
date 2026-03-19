import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/mcp/rendercv/prompts/rendercv", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("covers rendercv prompt registration", async () => {
    const registerPrompt = vi.fn((_name: string, _meta: any, cb: any) => cb());
    const server = { registerPrompt } as any;
    const { registerRenderscvPrompt } = await import("../rendercv");
    const res = await registerRenderscvPrompt(server);
    expect(registerPrompt).toHaveBeenCalled();
    const body = res as {
      messages?: Array<{ content?: { text?: string } }>;
    };
    expect(body.messages?.[0]?.content?.text).toMatch(/rendercv:\/\/schema-and-prompt/);
  });
});

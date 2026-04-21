import { describe, it, expect, vi } from "vitest";

describe("durable/rendercv.do.ts", () => {
  it(
    "routes proxy endpoints and initializes mcp registrations",
    async () => {
    vi.resetModules();

    const registerRenderscv = vi.fn();
    const registerWidgetUi = vi.fn();

    class McpAgentBase {
      constructor(_state: any, _env: any) {}
      name = "agent";
      props = {};
      async fetch(_req: Request) {
        return new Response("mcp");
      }
      async onStart() {
        return undefined;
      }
      onClose() {
        return undefined;
      }
      async init() {
        return undefined;
      }
      async onConnect() {
        return undefined;
      }
    }

    vi.doMock("agents/mcp", () => ({
      McpAgent: McpAgentBase,
      getMcpAuthContext: () => ({ sub: "x" }),
    }));
    vi.doMock("@modelcontextprotocol/sdk/server/mcp.js", () => ({
      McpServer: class {
        constructor(_cfg: any) {}
      },
    }));
    vi.doMock("../mcp/rendercv/register", () => ({ registerRenderscv }));
    vi.doMock("../mcp/widget-ui/register", () => ({ registerWidgetUi }));
    vi.doMock("../rendercv/renderer/renderer", () => ({
      Renderer: class {
        async buildTypstSource() {
          return "= test";
        }
      },
    }));
    vi.doMock("../typst/typst-compiler-manager", () => ({
      TypstCompilerManager: class {
        async compilePdf() {
          return { ok: true, data: new Uint8Array([1, 2, 3]) };
        }
      },
    }));
    vi.doMock("../oauth/auth0", () => ({
      createAuth0OAuthProvider: () => ({ fetch: vi.fn().mockResolvedValue(new Response("oauth")) }),
    }));

    const { RendercvDo, RendercvOAuthProvider } = await import("../rendercv.do");
    expect(RendercvOAuthProvider).toBeDefined();

    const sqlExec = vi.fn();
    const obj = new RendercvDo(
      { storage: { sql: { exec: sqlExec } } } as any,
      {} as any,
    );
    expect(sqlExec).toHaveBeenCalledTimes(1);
    await obj.init();
    expect(registerRenderscv).toHaveBeenCalledTimes(1);
    expect(registerWidgetUi).toHaveBeenCalledTimes(1);

    await obj.onStart();
    obj.onClose({} as any, 1000, "bye", true);
    await obj.onConnect({} as any, { request: new Request("http://localhost") } as any);

    const gen = await obj.fetch(new Request("http://localhost/api/v1/generate", { method: "POST", body: "{}" }));
    expect(await gen.text()).toBe("mcp");
    },
    15_000,
  );
});

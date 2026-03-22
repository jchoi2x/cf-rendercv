import { describe, it, expect, vi, beforeEach } from "vitest";

import { wrapMcpAgentHandler } from "../mcp-user-session-env";

describe("durable/oauth/mcp-user-session-env", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("strips params.sessionId from MCP initialize requests", async () => {
    const captured: any[] = [];

    const handler = {
      fetch: vi.fn(async (req: Request) => {
        const json = await req.clone().json();
        captured.push(json);
        return new Response("ok");
      }),
    };

    const wrapped = wrapMcpAgentHandler(handler as any);

    const env: any = {
      MCP_OBJECT: {
        newUniqueId: () => ({ toString: () => "ignored" }),
      },
      // envWithUserPinnedMcpObject also spreads env, so keep it minimal but stable.
    };

    const ctx: any = {
      props: { claims: { sub: "user|test" } },
    };

    const request = new Request("https://example.com/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-01-01",
          sessionId: "should-be-removed",
          capabilities: {},
        },
      }),
    });

    await wrapped.fetch(request, env, ctx as any);

    expect(captured).toHaveLength(1);
    expect(captured[0]!.params.sessionId).toBeUndefined();
  });

  it("leaves requests untouched when initialize has no sessionId", async () => {
    const captured: any[] = [];

    const handler = {
      fetch: vi.fn(async (req: Request) => {
        const json = await req.clone().json();
        captured.push(json);
        return new Response("ok");
      }),
    };

    const wrapped = wrapMcpAgentHandler(handler as any);

    const env: any = {
      MCP_OBJECT: {
        newUniqueId: () => ({ toString: () => "ignored" }),
      },
    };

    const ctx: any = {
      props: { claims: { sub: "user|test" } },
    };

    const request = new Request("https://example.com/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-01-01",
          capabilities: {},
        },
      }),
    });

    await wrapped.fetch(request, env, ctx as any);

    expect(captured).toHaveLength(1);
    expect(captured[0]!.params.sessionId).toBeUndefined();
  });
});


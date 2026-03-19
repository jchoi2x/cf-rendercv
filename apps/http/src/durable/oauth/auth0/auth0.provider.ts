import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import type { McpAgent } from "agents/mcp";

import { Auth0Handler, tokenExchangeCallback } from "./auth0.handler";

export type AuthContext = {
  claims: { sub: string; name: string; email: string };
  permissions: string[];
};

export const createAuth0OAuthProvider = (
  mcpAgent: typeof McpAgent<Env, unknown, {}>,
) =>
  new OAuthProvider<Env>({
    // NOTE - during the summer 2025, the SSE protocol was deprecated and replaced by the Streamable-HTTP protocol
    // https://developers.cloudflare.com/agents/model-context-protocol/transport/#mcp-server-with-authentication
    apiHandler: mcpAgent.serve("/mcp"),
    apiHandlers: {
      "/sse": mcpAgent.serveSSE("/sse", { binding: "MCP_OBJECT" }),
      "/mcp": {
        fetch: (_request: Request, _env: Env, _ctx: ExecutionContext) => {
          return mcpAgent
            .serve("/mcp", { binding: "MCP_OBJECT" })
            .fetch(_request, _env, _ctx);
        },
      },
    },
    authorizeEndpoint: "/authorize",
    clientRegistrationEndpoint: "/register",
    defaultHandler: Auth0Handler as any,
    tokenEndpoint: "/token",
    tokenExchangeCallback,
  });

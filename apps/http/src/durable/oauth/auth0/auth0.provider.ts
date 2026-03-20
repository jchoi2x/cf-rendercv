import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import type { McpAgent } from "agents/mcp";

import { Auth0Handler, tokenExchangeCallback } from "./auth0.handler";
import { wrapMcpAgentHandler } from "../mcp-user-session-env";

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
    apiHandler: wrapMcpAgentHandler(mcpAgent.serve("/mcp")),
    apiHandlers: {
      "/sse": wrapMcpAgentHandler(
        mcpAgent.serveSSE("/sse", { binding: "MCP_OBJECT" }),
      ),
      "/mcp": wrapMcpAgentHandler(
        mcpAgent.serve("/mcp", { binding: "MCP_OBJECT" }),
      ),
    },
    authorizeEndpoint: "/authorize",
    clientRegistrationEndpoint: "/register",
    defaultHandler: Auth0Handler as any,
    tokenEndpoint: "/token",
    tokenExchangeCallback,
  });

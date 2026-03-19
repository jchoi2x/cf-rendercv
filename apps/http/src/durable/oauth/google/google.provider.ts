import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import type { McpAgent } from "agents/mcp";
import { GoogleHandler } from "./google.handler";

export const createGoogleOAuthProvider = (
  mcpAgent: typeof McpAgent<Env, unknown, {}>,
) =>
  new OAuthProvider({
    // NOTE - during the summer 2025, the SSE protocol was deprecated and replaced by the Streamable-HTTP protocol
    // https://developers.cloudflare.com/agents/model-context-protocol/transport/#mcp-server-with-authentication
    apiHandlers: {
      "/sse": mcpAgent.serveSSE("/sse", { binding: "MCP_OBJECT" }),
      "/mcp": mcpAgent.serve("/mcp", { binding: "MCP_OBJECT" }),
    },

    authorizeEndpoint: "/authorize",
    clientRegistrationEndpoint: "/register",
    defaultHandler: GoogleHandler as any,
    tokenEndpoint: "/token",
  });

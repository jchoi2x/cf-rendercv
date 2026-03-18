import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { widgetUI } from "../widgets/widgetUI.js";

export const registerShowWidgetTool = (server: McpServer) => {
  return registerAppTool(server, 'show_widget', {
    description: 'Show widget',
    inputSchema: { query: z.string() },
    _meta: { ui: { resourceUri: widgetUI.resource.uri } }
  }, async ({ query }) => {
    return { content: [{ type: 'text', text: `Query: ${query}` }] };
  });
}


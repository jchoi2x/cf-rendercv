import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";

import type { AuthContext } from "../../../oauth/auth0";
import { widgetUI } from "../widgets/widgetUI";

export const registerShowWidgetTool = (
  server: McpServer,
  _props?: AuthContext,
) => {
  return registerAppTool(
    server,
    "show_widget",
    {
      description: "Show widget",
      inputSchema: { query: z.string() },
      _meta: { ui: { resourceUri: widgetUI.resource.uri } },
    },
    async ({ query }) => {
      return { content: [{ type: "text", text: `Query: ${query}` }] };
    },
  );
};

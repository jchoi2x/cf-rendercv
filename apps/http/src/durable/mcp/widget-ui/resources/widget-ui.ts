import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { widgetUI } from "../widgets/widgetUI";
import { registerAppResource } from "@modelcontextprotocol/ext-apps/server";

export const registerWidgetUiResource = (server: McpServer) => {
  return registerAppResource(
    server,
    "widget_ui",
    widgetUI.resource.uri,
    {
      description: "Widget UI",
    },
    async () => ({
      contents: [widgetUI.resource],
    }),
  );
};

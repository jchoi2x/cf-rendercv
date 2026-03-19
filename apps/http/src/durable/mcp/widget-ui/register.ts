import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerShowWidgetTool } from "./tools/show-widget";
import { registerWidgetUiResource } from "./resources/widget-ui";

export const registerWidgetUi = (server: McpServer) => {
  registerShowWidgetTool(server);
  registerWidgetUiResource(server);
};

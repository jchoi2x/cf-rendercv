import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

import { registerWidgetUiResource } from "./resources/widget-ui";
import { registerShowWidgetTool } from "./tools/show-widget";
import type { AuthContext } from "../../oauth/auth0";

export const registerWidgetUi = (server: McpServer, _props?: AuthContext) => {
  registerShowWidgetTool(server, _props);
  registerWidgetUiResource(server, _props);
};

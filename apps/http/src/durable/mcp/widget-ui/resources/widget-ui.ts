import { registerAppResource } from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { AuthContext } from "../../../oauth/auth0";
import { widgetUI } from "../widgets/widgetUI";

export const registerWidgetUiResource = (
  server: McpServer,
  _props?: AuthContext,
) => {
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
